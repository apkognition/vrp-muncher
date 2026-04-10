const STANDARD = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const REMAP = "o4abcjrh1XvEdQiufn7BDCzYVs0G6U-3298Wtm_JkKTwReqS5ZILlAFNpgHMPOxy";

export const xflate = {
    deflate: async (input: string): Promise<string> => {
        const bytes = new TextEncoder().encode(input);

        const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate'));
        const compressedBytes = new Uint8Array(await new Response(stream).arrayBuffer());

        const result = Array.from(compressedBytes, b => String.fromCharCode(b)).join('');
        return result;
    },
    inflate: async (input: string): Promise<string> => {
        const bytes = new Uint8Array(input.length);
        for (let i = 0; i < input.length; i++) {
            bytes[i] = input.charCodeAt(i);
        }

        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
        const decompressedBytes = new Uint8Array(await new Response(stream).arrayBuffer());

        const result = new TextDecoder().decode(decompressedBytes)
        return result;
    }
};

const ALPH = "HQ;Rr-dDK*I16vMWf8L&2:GBem5s(CgF.+kqtSPE/Yl)U9@y?Awo'N,X~Z=O3b0_VpuTxcnJz7a!h$4ij";
const PLATFORM_CHARS = [',', '.', ';'];

export const b82 = {
    encode: (input: string): string => {
        if (!input) return "";
        const bytes = Uint8Array.from(input, c => c.charCodeAt(0));

        let value = 0n;
        value = (value << 8n) + BigInt(1);
        for (const byte of bytes) {
            value = (value << 8n) + BigInt(byte);
        }

        let res = "";
        const base = BigInt(ALPH.length);
        while (value > 0n) {
            res = ALPH[Number(value % base)] + res;
            value /= base;
        }

        return res;
    },

    decode: (str: string): string => {
        if (!str) return "";
        const lookup = new Map();
        for (let i = 0; i < ALPH.length; i++) lookup.set(ALPH[i], BigInt(i));

        let value = 0n;
        const base = BigInt(ALPH.length);

        for (const char of str) {
            const charValue = lookup.get(char);
            if (charValue === undefined) throw new Error(`Invalid Base82 char: ${char}`);
            value = (value * base) + charValue;
        }

        const bytes = [];
        while (value > 0n) {
            bytes.unshift(Number(value & 0xFFn));
            value >>= 8n;
        }

        bytes.shift();

        return String.fromCharCode(...bytes);
    }
};