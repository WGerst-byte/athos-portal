# -*- coding: utf-8 -*-
"""
QR Code generator library (Python)
Ported from Project Nayuki (MIT License) - standards-compliant ISO/IEC 18004.
"""

import collections

class QrCode:
    """Represents an immutable square grid of black/white modules."""
    
    class Ecc:
        def __init__(self, ordinal, format_bits):
            self.ordinal = ordinal
            self.format_bits = format_bits
    
    MIN_VERSION = 1
    MAX_VERSION = 40
    
    # Penalties
    PENALTY_N1 = 3
    PENALTY_N2 = 3
    PENALTY_N3 = 40
    PENALTY_N4 = 10
    
    ECC_CODEWORDS_PER_BLOCK = [
        # Version 0 (unused)
        None,
        [-1,  7, 10, 13, 17],
        [-1, 10, 16, 22, 28],
        [-1, 15, 26, 36, 44],
        [-1, 20, 18, 26, 16],
        [-1, 26, 24, 18, 22],
        [-1, 18, 16, 24, 28],
        [-1, 20, 18, 18, 26],
        [-1, 24, 22, 22, 26],
        [-1, 30, 22, 20, 24],
        [-1, 18, 26, 24, 28],
    ]
    
    NUM_ERROR_CORRECTION_BLOCKS = [
        None,
        [-1, 1, 1, 1, 1],
        [-1, 1, 1, 1, 1],
        [-1, 1, 1, 2, 2],
        [-1, 1, 2, 2, 4],
        [-1, 1, 2, 4, 4],
        [-1, 2, 4, 4, 4],
        [-1, 2, 4, 6, 5],
        [-1, 2, 4, 6, 6],
        [-1, 2, 5, 8, 8],
        [-1, 4, 5, 8, 8],
    ]

    _ALIGNMENT_PATTERN_BASE_ROW = [
        None,
        [],
        [6, 18],
        [6, 22],
        [6, 26],
        [6, 30],
        [6, 34],
        [6, 22, 38],
        [6, 24, 42],
        [6, 26, 46],
        [6, 28, 50],
    ]

    @staticmethod
    def encode_text(text, ecc):
        # Byte mode encoding
        data = text.encode("utf-8")
        bit_buffer = []
        # Mode: 0100 (Byte)
        bit_buffer.extend([0, 1, 0, 0])
        
        # We find minimal version that fits
        for version in range(1, 11):
            num_data_codewords = QrCode.get_num_data_codewords(version, ecc)
            # Length indicator: 8 bits for versions 1..9, 16 bits for 10..40
            char_count_bits = 8 if version < 10 else 16
            data_capacity_bits = num_data_codewords * 8
            
            total_bits = 4 + char_count_bits + len(data) * 8
            if total_bits <= data_capacity_bits:
                break
        else:
            raise ValueError("Data too long")
            
        for i in range(char_count_bits - 1, -1, -1):
            bit_buffer.append((len(data) >> i) & 1)
        for b in data:
            for i in range(7, -1, -1):
                bit_buffer.append((b >> i) & 1)
                
        # Terminator
        for _ in range(min(4, data_capacity_bits - len(bit_buffer))):
            bit_buffer.append(0)
        # Pad to byte
        while len(bit_buffer) % 8 != 0:
            bit_buffer.append(0)
            
        # Pad bytes 0xEC, 0x11
        pad_bytes = [0xEC, 0x11]
        pad_idx = 0
        while len(bit_buffer) < data_capacity_bits:
            b = pad_bytes[pad_idx]
            pad_idx ^= 1
            for i in range(7, -1, -1):
                bit_buffer.append((b >> i) & 1)
                
        data_codewords = []
        for i in range(0, len(bit_buffer), 8):
            val = 0
            for j in range(8):
                val = (val << 1) | bit_buffer[i + j]
            data_codewords.append(val)
            
        return QrCode._encode_codewords(version, ecc, data_codewords)

    @staticmethod
    def get_num_data_codewords(version, ecc):
        total_codewords = QrCode.get_num_raw_data_modules(version) // 8
        ecc_per_block = QrCode.ECC_CODEWORDS_PER_BLOCK[version][ecc.ordinal]
        num_blocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[version][ecc.ordinal]
        return total_codewords - ecc_per_block * num_blocks

    @staticmethod
    def get_num_raw_data_modules(version):
        size = version * 4 + 17
        num_modules = size * size
        num_modules -= 64 * 3  # Finder patterns
        num_modules -= 15 * 2 + 1  # Format bits
        num_modules -= (size - 16) * 2  # Timing patterns
        
        # Alignment patterns
        num_align = len(QrCode._ALIGNMENT_PATTERN_BASE_ROW[version])
        if num_align > 0:
            # Total alignment patterns = num_align^2 - 3 (corners overlapping finders)
            num_modules -= (num_align * num_align - 3) * 25
            # Overlaps with timing patterns
            num_modules += (num_align - 2) * 2 * 5
        return num_modules

    @staticmethod
    def _encode_codewords(version, ecc, data_codewords):
        num_blocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[version][ecc.ordinal]
        ecc_per_block = QrCode.ECC_CODEWORDS_PER_BLOCK[version][ecc.ordinal]
        total_data = QrCode.get_num_data_codewords(version, ecc)
        
        # Split into blocks
        short_block_len = total_data // num_blocks
        num_short_blocks = num_blocks - (total_data % num_blocks)
        
        blocks = []
        offset = 0
        for i in range(num_blocks):
            blen = short_block_len + (0 if i < num_short_blocks else 1)
            bdata = data_codewords[offset : offset + blen]
            offset += blen
            becc = QrCode._reed_solomon_compute_ecc(bdata, ecc_per_block)
            blocks.append((bdata, becc))
            
        # Interleave data
        all_codewords = []
        for i in range(short_block_len + 1):
            for bdata, _ in blocks:
                if i < len(bdata):
                    all_codewords.append(bdata[i])
                    
        # Interleave ECC
        for i in range(ecc_per_block):
            for _, becc in blocks:
                all_codewords.append(becc[i])
                
        return QrCode(version, ecc, all_codewords)

    @staticmethod
    def _reed_solomon_compute_ecc(data, num_ecc):
        # Galois field tables
        exp = [0] * 512
        log = [0] * 256
        x = 1
        for i in range(255):
            exp[i] = x
            exp[i + 255] = x
            log[x] = i
            x <<= 1
            if x & 256: x ^= 0x11D
            
        def mul(a, b):
            if a == 0 or b == 0: return 0
            return exp[log[a] + log[b]]
            
        # Generator
        gen = [1]
        for i in range(num_ecc):
            new_gen = [0] * (len(gen) + 1)
            for j in range(len(gen)):
                new_gen[j] ^= gen[j]
                new_gen[j + 1] ^= mul(gen[j], exp[i])
            gen = new_gen
            
        # Divide
        res = [0] * num_ecc
        for byte in data:
            factor = byte ^ res.pop(0)
            res.append(0)
            for j in range(num_ecc):
                res[j] ^= mul(gen[j + 1], factor)
        return res

    def __init__(self, version, ecc, all_codewords):
        self.version = version
        self.size = version * 4 + 17
        self.modules = [[False] * self.size for _ in range(self.size)]
        self.is_function = [[False] * self.size for _ in range(self.size)]
        
        # 1. Function patterns
        self._draw_finder(0, 0)
        self._draw_finder(self.size - 7, 0)
        self._draw_finder(0, self.size - 7)
        self._draw_alignment_patterns()
        self._draw_timing_patterns()
        
        # 2. Format info space
        self._set_function_format_info()
        
        # 3. Draw Codewords with zigzag
        self._draw_codewords(all_codewords)
        
        # 4. Mask evaluation
        best_mask = 0
        min_penalty = 1 << 30
        for mask in range(8):
            self._apply_mask(mask)
            self._draw_format_bits(ecc, mask)
            penalty = self._get_penalty_score()
            if penalty < min_penalty:
                min_penalty = penalty
                best_mask = mask
            self._apply_mask(mask)  # revert
            
        self._apply_mask(best_mask)
        self._draw_format_bits(ecc, best_mask)

    def _draw_finder(self, x, y):
        for r in range(-1, 8):
            for c in range(-1, 8):
                gr, gc = y + r, x + c
                if 0 <= gr < self.size and 0 <= gc < self.size:
                    self.is_function[gr][gc] = True
                    if 0 <= r <= 6 and 0 <= c <= 6:
                        self.modules[gr][gc] = (r in (0, 6) or c in (0, 6) or (2 <= r <= 4 and 2 <= c <= 4))
                    else:
                        self.modules[gr][gc] = False

    def _draw_alignment_patterns(self):
        coords = QrCode._ALIGNMENT_PATTERN_BASE_ROW[self.version]
        for y in coords:
            for x in coords:
                # Skip if overlapping finders
                if (x <= 7 and y <= 7) or (x >= self.size - 8 and y <= 7) or (x <= 7 and y >= self.size - 8):
                    continue
                for r in range(-2, 3):
                    for c in range(-2, 3):
                        self.is_function[y + r][x + c] = True
                        self.modules[y + r][x + c] = (max(abs(r), abs(c)) in (0, 2))

    def _draw_timing_patterns(self):
        for i in range(7, self.size - 7):
            self.is_function[6][i] = True
            self.modules[6][i] = (i % 2 == 0)
            self.is_function[i][6] = True
            self.modules[i][6] = (i % 2 == 0)
            
        # Dark module
        self.is_function[self.size - 8][8] = True
        self.modules[self.size - 8][8] = True

    def _set_function_format_info(self):
        for i in range(9):
            self.is_function[8][i] = True
            self.is_function[i][8] = True
        for i in range(self.size - 8, self.size):
            self.is_function[8][i] = True
            self.is_function[i][8] = True

    def _draw_format_bits(self, ecc, mask):
        data = (ecc.format_bits << 3) | mask
        rem = data
        for _ in range(10):
            rem = (rem << 1) ^ ((rem >> 9) * 0x537)
        bits = ((data << 10) | rem) ^ 0x5412
        
        # Primary copy around top-left
        for i in range(0, 6):
            self.modules[8][i] = bool((bits >> (14 - i)) & 1)
        self.modules[8][7] = bool((bits >> 8) & 1)
        self.modules[8][8] = bool((bits >> 7) & 1)
        self.modules[7][8] = bool((bits >> 6) & 1)
        for i in range(9, 15):
            self.modules[14 - i][8] = bool((bits >> (14 - i)) & 1)
            
        # Secondary copy around top-right and bottom-left
        for i in range(0, 8):
            self.modules[8][self.size - 1 - i] = bool((bits >> (14 - i)) & 1)
        for i in range(8, 15):
            self.modules[self.size - 15 + i][8] = bool((bits >> (14 - i)) & 1)

    def _draw_codewords(self, all_codewords):
        bit_idx = 0
        total_bits = len(all_codewords) * 8
        c = self.size - 1
        while c > 0:
            if c == 6: c -= 1
            upwards = (((self.size - 1 - c) // 2) % 2 == 0)
            rows = range(self.size - 1, -1, -1) if upwards else range(self.size)
            for r in rows:
                for col in (c, c - 1):
                    if not self.is_function[r][col]:
                        if bit_idx < total_bits:
                            byte_val = all_codewords[bit_idx >> 3]
                            self.modules[r][col] = bool((byte_val >> (7 - (bit_idx & 7))) & 1)
                            bit_idx += 1
                        else:
                            self.modules[r][col] = False
            c -= 2

    def _apply_mask(self, mask):
        for r in range(self.size):
            for c in range(self.size):
                if not self.is_function[r][c]:
                    invert = False
                    if mask == 0:   invert = (r + c) % 2 == 0
                    elif mask == 1: invert = r % 2 == 0
                    elif mask == 2: invert = c % 3 == 0
                    elif mask == 3: invert = (r + c) % 3 == 0
                    elif mask == 4: invert = (r // 2 + c // 3) % 2 == 0
                    elif mask == 5: invert = ((r * c) % 2 + (r * c) % 3) == 0
                    elif mask == 6: invert = (((r * c) % 2 + (r * c) % 3) % 2) == 0
                    elif mask == 7: invert = (((r + c) % 2 + (r * c) % 3) % 2) == 0
                    if invert:
                        self.modules[r][c] = not self.modules[r][c]

    def _get_penalty_score(self):
        penalty = 0
        # N1: 5 or more same color in row/col
        for r in range(self.size):
            count = 1
            for c in range(1, self.size):
                if self.modules[r][c] == self.modules[r][c - 1]:
                    count += 1
                else:
                    if count >= 5: penalty += QrCode.PENALTY_N1 + (count - 5)
                    count = 1
            if count >= 5: penalty += QrCode.PENALTY_N1 + (count - 5)
            
        for c in range(self.size):
            count = 1
            for r in range(1, self.size):
                if self.modules[r][c] == self.modules[r - 1][c]:
                    count += 1
                else:
                    if count >= 5: penalty += QrCode.PENALTY_N1 + (count - 5)
                    count = 1
            if count >= 5: penalty += QrCode.PENALTY_N1 + (count - 5)
            
        # N2: 2x2 blocks
        for r in range(self.size - 1):
            for c in range(self.size - 1):
                val = self.modules[r][c]
                if val == self.modules[r + 1][c] == self.modules[r][c + 1] == self.modules[r + 1][c + 1]:
                    penalty += QrCode.PENALTY_N2
                    
        # N3: 1 0 1 1 1 0 1 0 0 0 0 or reverse
        p1 = [True, False, True, True, True, False, True, False, False, False, False]
        p2 = [False, False, False, False, True, False, True, True, True, False, True]
        for r in range(self.size):
            for c in range(self.size - 10):
                sub = [self.modules[r][c + k] for k in range(11)]
                if sub == p1 or sub == p2: penalty += QrCode.PENALTY_N3
        for c in range(self.size):
            for r in range(self.size - 10):
                sub = [self.modules[r + k][c] for k in range(11)]
                if sub == p1 or sub == p2: penalty += QrCode.PENALTY_N3
                
        # N4: Balance
        dark = sum(row.count(True) for row in self.modules)
        total = self.size * self.size
        ratio = (dark * 100) // total
        k = abs(ratio - 50) // 5
        penalty += k * QrCode.PENALTY_N4
        return penalty

    def to_svg_str(self, border=4):
        total_size = self.size + border * 2
        parts = [
            f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total_size} {total_size}" width="100%" height="100%">',
            f'<rect width="{total_size}" height="{total_size}" fill="#ffffff"/>',
            '<path fill="#000000" d="'
        ]
        d = []
        for r in range(self.size):
            for c in range(self.size):
                if self.modules[r][c]:
                    d.append(f'M{c + border},{r + border}h1v1h-1z')
        parts.append(' '.join(d))
        parts.append('"/></svg>')
        return '\n'.join(parts)

    def to_png_bytes(self, border=4, scale=12):
        import zlib, struct
        dim = (self.size + border * 2) * scale
        raw = []
        for r in range(-border, self.size + border):
            for _ in range(scale):
                row = bytearray([0])
                for c in range(-border, self.size + border):
                    dark = (0 <= r < self.size and 0 <= c < self.size and self.modules[r][c])
                    val = 0 if dark else 255
                    row.extend([val] * scale)
                raw.append(bytes(row))
        compressed = zlib.compress(b''.join(raw), level=9)
        png = bytearray(b'\x89PNG\r\n\x1a\n')
        ihdr = struct.pack('>IIBBBBB', dim, dim, 8, 0, 0, 0, 0)
        png.extend(struct.pack('>I4s', len(ihdr), b'IHDR') + ihdr + struct.pack('>I', zlib.crc32(b'IHDR' + ihdr) & 0xffffffff))
        png.extend(struct.pack('>I4s', len(compressed), b'IDAT') + compressed + struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff))
        png.extend(struct.pack('>I4s', 0, b'IEND') + struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff))
        return bytes(png)

# Initialize ECC constants
QrCode.Ecc.LOW = QrCode.Ecc(1, 0b01)
QrCode.Ecc.MEDIUM = QrCode.Ecc(2, 0b00)
QrCode.Ecc.QUARTILE = QrCode.Ecc(3, 0b11)
QrCode.Ecc.HIGH = QrCode.Ecc(4, 0b10)

if __name__ == '__main__':
    url = "https://wgerst-byte.github.io/athos-portal/"
    qr = QrCode.encode_text(url, QrCode.Ecc.MEDIUM)
    print(f"Generated QR Code: Version {qr.version} ({qr.size}x{qr.size} modules)")
    
    with open("c:/Users/wgers/Antigravity/athos-portal/assets/images/qr-code.svg", "w", encoding="utf-8") as f:
        f.write(qr.to_svg_str(border=4))
        
    png_data = qr.to_png_bytes(border=4, scale=12)
    with open("c:/Users/wgers/Antigravity/athos-portal/assets/images/qr-code.png", "wb") as f:
        f.write(png_data)
        
    print(f"Saved qr-code.svg and qr-code.png ({len(png_data)} bytes)")
