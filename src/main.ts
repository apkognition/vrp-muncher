const textbox = document.getElementById("url-input") as HTMLInputElement;
const outputBox = document.getElementById("url-output") as HTMLInputElement;

function processInputUrl(url: string) {
    if (!url.trim()) {
        return;
    }

    const outputUrl = url.startsWith("vrps://")
        ? unmunch(url.slice(7))
        : `vrps://${munch(url)}`;

    outputBox.value = outputUrl
}

const munch = (rawUrl: string): string => {
    const rotText = rot13(rawUrl);
    const munchedUrl = B66C.encode(new TextEncoder().encode(rotText));
    return munchedUrl;
}

const unmunch = (encodedUrl: string): string => {
    const unbasedText = new TextDecoder().decode(B66C.decode(encodedUrl));
    const unmunchedUrl = rot13(unbasedText);
    return unmunchedUrl;
}

function rot13(str: string): string {
    return str.replace(/[a-zA-Z]/g, (char) => {
        const base = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
    });
}

const codec = {
    encode: (str: string): string => btoa(String.fromCodePoint(...new TextEncoder().encode(str))).replace(/=+$/, ''),
    decode: (b64: string): string => new TextDecoder().decode(Uint8Array.from(atob(b64), c => c.codePointAt(0))),
};

class B66C {
    static readonly alphabet: string = "Mh7_nT5pifK3~P8IYlGvwASFVy62LdjBX.oruJsRxatkDeQzcWg1bHmU0CNE9-qZO4";
    static readonly base: bigint = 66n;

    static encode(bytes: Uint8Array): string {
        if (bytes.length === 0) return "";

        let num = 0n;
        for (const byte of bytes) {
            num = (num << 8n) | BigInt(byte);
        }

        let result = "";
        while (num > 0n) {
            const remainder = num % this.base;
            result = this.alphabet[Number(remainder)] + result;
            num = num / this.base;
        }

        for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
            result = this.alphabet[0] + result;
        }

        return result || this.alphabet[0];
    }

    static decode(str: string): Uint8Array {
        if (str.length === 0) return new Uint8Array(0);

        let num = 0n;
        for (const char of str) {
            const index = this.alphabet.indexOf(char);
            if (index === -1) throw new Error(`Invalid character in munch: ${char}`);
            num = (num * this.base) + BigInt(index);
        }

        let hex = num.toString(16);
        if (hex.length % 2 !== 0) hex = "0" + hex;

        const bytes: number[] = [];
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substr(i, 2), 16));
        }

        let leadingZeros = 0;
        for (let i = 0; i < str.length && str[i] === this.alphabet[0]; i++) {
            leadingZeros++;
        }

        const finalArr = new Uint8Array(leadingZeros + bytes.length);
        finalArr.set(bytes, leadingZeros);
        return finalArr;
    }
}

const getEncodedPayload = (): string => {
    const hash = window.location.hash;
    if (hash.length <= 1) return "";
    return hash.substring(1);
};

window.addEventListener("DOMContentLoaded", async () => {
    const payload = getEncodedPayload();
    const textbox = document.getElementById("url-input") as HTMLInputElement;

    if (payload && textbox) {
        try {
            const originalUrl = unmunch(payload);
            outputBox.value = originalUrl;

            outputBox.parentElement!.height = 100;
            document.getElementById("copy-embedded-button")!.hidden = true;

            console.log("Extracted URL:", originalUrl);
        } catch (e) {
            console.error("Failed to decode fragment:", e);
        }
    }
});

document.getElementById("munch-button")!.onclick = () => {
    processInputUrl(textbox.value);
};

document.getElementById("copy-button")!.onclick = async (event) => {
    const outputBoxText = outputBox.value;
    if (!outputBoxText) {
        return;
    }

    navigator.clipboard.writeText(outputBoxText);
};

document.getElementById("copy-embedded-button")!.onclick = async () => {
    const outputBoxText = outputBox.value;
    if (!outputBoxText) {
        return;
    }

    const url = outputBoxText.startsWith("vrps://")
        ? outputBoxText.slice(7)
        : outputBoxText;

    navigator.clipboard.writeText(`https://${window.location.hostname}/#${url}`);
};