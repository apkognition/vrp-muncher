import { b82, xflate } from "./b82";

export const vrps_prot = "vrps://"

interface Step {
    n?: string,
    f: (a: string) => string | Promise<string>,
    b: (a: string) => string | Promise<string>,
};

const steps: Step[] = [
    {
        n: "substring",
        f: reduceCommonSubstrings,
        b: expandCommonSubstrings,
    },
    {
        n: "xflate",
        f: deflate,
        b: inflate
    },
    {
        f: b82.encode,
        b: b82.decode,
    },
    {
        n: "shift",
        f: rot13,
        b: rot13,
    },
];

export async function processInputUrl(url: string): Promise<string | null> {
    if (!url.trim()) {
        return null;
    }

    return url.startsWith(vrps_prot)
        ? await unmunch(url.slice(7))
        : `${vrps_prot}${await munch(url)}`;
}

export const munch = async (input: string, log: boolean = true): Promise<string> => {
    return await steps.reduce(async (accP, step) => {
        const acc = await accP

        const stepR = await step.f(acc)
        if (log) {
            console.debug(step.n ?? step.f.name, acc.length, "->", stepR.length);
        }

        return stepR
    }, Promise.resolve(input));
};

export const unmunch = async (input: string): Promise<string> => {
    return await steps.toReversed().reduce(async (acc, step) => await step.b(await acc), Promise.resolve(input));
};

function rot13(str: string): string {
    return str.replace(/[a-zA-Z]/g, (char) => {
        const base = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
    });
}

export function trimVrpProtocol(str: string): string {
    return str.startsWith(vrps_prot)
        ? str.slice(7)
        : str;
}

async function deflate(str: string): Promise<string> {
    const deflated = await xflate.deflate(str)

    return deflated.length + 1 < str.length
        ? `!${deflated}`
        : str;
}

async function inflate(str: string): Promise<string> {
    if (!str.startsWith('!')) {
        return str
    }

    const inflated = await xflate.inflate(str.slice(1))
    return inflated
}

function reduceCommonSubstrings(str: string): string {
    return FRAGMENTS.reduce((str, fragment, i) => {
        const byteMarker = String.fromCharCode(FRAGMENT_OFFSET + i);
        return str.split(fragment).join(byteMarker);
    }, str);
}

function expandCommonSubstrings(str: string): string {
    return str.split('').map(char => {
        const code = char.charCodeAt(0);
        if (code >= 128 && code < 1278 + FRAGMENTS.length) {
            return FRAGMENTS[code - FRAGMENT_OFFSET];
        }
        return char;
    }).join('');
}

const FRAGMENT_OFFSET = 128;
const FRAGMENTS = [
    "https://discord.com/",
    "https://github.com/",
    "https://reddit.com/",
    "https://gofile.io/",

    "?utm_campaign=",
    "&utm_content=",
    "?utm_source=",
    "?utm_medium=",
    "https://www.",

    "http://",

    ".html",
    ".json",
    ".php",

    "www.",
    "cdn.",
    ".com",
    ".io",
    ".me"
]