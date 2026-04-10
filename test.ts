import { munch, unmunch } from "./src/munch";
const MUNCH_LOGS = false

const URLS = [
    "https://github.com/bun-community/bun-types/blob/main/README.md",
    "https://www.google.com/search?q=how+to+optimize+deflate+for+small+strings&client=safari",
    "https://amazon.com/dp/B08N5KWBKK?_encoding=UTF8&psc=1&ref_=cm_sw_r_cp_ud_dp_12345",
    "https://en.wikipedia.org/wiki/Huffman_coding#/media/File:Huffman_huff_graph.svg",
    `https://internal.api/v1/trace/${crypto.randomUUID()}`,
    `http://www.sample.net/?horn=bulb`,
    `http://sample.net/?base=spark&swim=ants`,
    `http://www.sample.edu/?range=throat&locket=bird`,
    `http://www.sample.edu/meat?recess=addition`,
    `https://www.sample.org/#leg`,
    `https://sample.edu/airplane#magic`,
    `http://sample.net/?base=skate`,
    `http://www.sample.info/?thing=bridge&company=record`,
    `https://sample.org/giants.aspx`,
    `https://sample.org/#angle`,
    `https://gofile.io/d/hhlJtf`,
    `http://www.sample.com/respect?army=pie`,
    `https://sample.info/women#afterthought`,
    `http://www.sample.org/work?trousers=lettuce`,
    `http://sample.edu/?letter=gold`,
    `https://sample.net/dogs#company`,
    `http://www.reallylong.link/rll/9V9egWKBF08p6F6rMoZroyBoLwDUUzXeAI/08tgS1AX_SAigNyG58GvNENVmw8MbTkFQ3ljbinGEAOoYVqCPixJwD9cj9CRQtFBvxMhVOOBroMhLMaGnX7cTqlY3KV2SX2qYhbsS7ep6k/S4lTIqGIqFLTDB7MpVa77osW3aEPvEGmolz65qKcAbmn3VWAkK4LVAztbkRXDu_xUoHhqUT4IF6qkebXjSgGqYvkgpAXvHqWXz/wXZhH1kXGXaCFu6oQBW8ssuuZVxQvzxA1SYgQbfyGeLXDkh8ofFjp31H8bSgr7UPu7VPGw75D99VrP8nbbEg/p_fzbYJL0imDixAhqdmT1RpDwOGFHcft0pZeKqY1NwKe4/TDpUOmEKxgN9EFrwbVXtHZhFwRL7EDjwR5ANSrDEmagC9dGPr2hZzqBRBsT07UgAfqNtLl3vh609fQiKOtCfIfWDun_VJ3GygwEtXNry8ITw8xcS4NXwu4SW7KLcrUGL447uB0F/YZc6kSzEBvBm7YIFQwHO35kkD4SJ1hVra/W7zsMyQ7N4sOnqNpUIjO2I6cFjpG_WVGW9vnI0vcf0_Pe1coYPy4FKraG_yZrfmXAXUiJUobzN1qsegYAz8dc8dOKzx59_cwVfJwPO0bpTvTJUPPNBVGCw2zI/FfCDECUdX4M/BKD_2vYOD3IT9T5_Yhme9EXJmUd__lf2b4_Rra55lnGe/16ZfzVqNEek90YFC/sEkLzrUqCfvzJE03pwnCfhEOsPTwACK45GChVeM0eoyi0wRfjkx9cvlWSu4I81KuQoWBABgViKKzwA49T9DN8ebmhJwlFlADXbNL23W0BEKp2mA0Q_/icGc1Jw2VDeVfRZO7kBWYswDWuCK8B5twmAKN_hBsNV/NqPR6h1GPKHc4AErRZI0W4/LBwPP8iwp60cQoKiBV3xW3ZqkfL8mrKXUGzv7tvXNLas/SOgkDr3DgWrmw/3R7wWyeFu5Qjoi`
];

let stdenable = false;
const log = (...data: any[]): void => { if (stdenable) console.log(data); }
const error = (...data: any[]): void => { if (stdenable) console.error(data); }

async function runBench() {
    log(`\n${"Category".padEnd(20)} | ${"Original".padStart(8)} | ${"Munched".padStart(8)} | ${"Saving"}`);
    log("-".repeat(60));
    for (const url of URLS) {
        try {
            const start = performance.now();
            const hash = await munch(url, MUNCH_LOGS);
            const end = performance.now();

            const originalLen = url.length;
            const munchedLen = hash.length;
            const saving = (((originalLen - munchedLen) / originalLen) * 100).toFixed(1);
            const time = (end - start).toFixed(3);

            const label = url.split('//')[1].split('/')[0];
            log(label, originalLen.toString(), munchedLen.toString(), `${saving}%`, `(${time}ms)`);

            const unmunched = await unmunch(hash);
            if (unmunched !== url) {
                error(`Unmunched result does not match the original url (${label})`);
            }
        }
        catch (e) {
            error("Test failed:", e);
        }
    }
}

runBench();
stdenable = true
runBench();