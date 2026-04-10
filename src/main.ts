import { processInputUrl, munch, unmunch, trimVrpProtocol } from "./munch.ts"

const textbox = document.getElementById("url-input") as HTMLInputElement;
const outputBox = document.getElementById("url-output") as HTMLInputElement;

const handleError = (error: unknown) => {
    const errorContainer = document.getElementById("error-container")!;
    const mainUI = document.getElementById("main-decoder-ui")!;
    const debugElement = document.getElementById("debug-info")!;
    const messageElement = document.getElementById("error-message")!;

    mainUI.classList.add("hidden");
    errorContainer.classList.remove("hidden");

    if (error instanceof Error) {
        debugElement.innerText = `${error.name}: ${error.message}\n${error.stack || ''}`;
    } else {
        debugElement.innerText = String(error);
    }

    if (String(error).includes("alphabet")) {
        messageElement.innerText = "Encoding mismatch. This link was likely munched with a different version of the tool.";
    }
};

const getEncodedPayload = (): string => {
    const hash = window.location.hash;
    if (hash.length <= 1) return "";
    return hash.substring(1);
};

const currentPage = window.location.pathname;

if (currentPage === "/d/" && !getEncodedPayload()) {
    window.location.href = "/"
}

window.addEventListener("DOMContentLoaded", async () => {
    const payload = getEncodedPayload();
    const textbox = document.getElementById("url-output") as HTMLInputElement;

    if (payload && textbox) {
        try {
            const originalUrl = unmunch(trimVrpProtocol(payload));
            outputBox.value = originalUrl;

            outputBox.parentElement!.height = 100;
            document.getElementById("copy-embedded-button")!.hidden = true;

            console.log("Extracted URL:", originalUrl);
        } catch (e) {
            console.error("Failed to decode fragment:", e);
            handleError(e)
        }
    }
});

document.getElementById("copy-button")!.onclick = async (event) => {
    const outputBoxText = outputBox.value;
    if (!outputBoxText) {
        return;
    }

    navigator.clipboard.writeText(outputBoxText);
};

if (currentPage == '/') {
    document.getElementById("munch-button")!.onclick = () => {
        const output = processInputUrl(textbox.value);

        if (!output) {
            return;
        }

        outputBox.value = output;
    };

    document.getElementById("copy-embedded-button")!.onclick = async () => {
        const outputBoxText = outputBox.value;
        if (!outputBoxText) {
            return;
        }

        const url = trimVrpProtocol(outputBoxText)

        navigator.clipboard.writeText(`https://${window.location.hostname}/d/#${url}`);
    };
}