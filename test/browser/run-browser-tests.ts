import puppeteer, { Browser } from 'puppeteer';
// @ts-ignore -- no type declarations available for serve-handler
import handler from 'serve-handler';
import http from 'http';
import path from 'path';
import chalk from 'chalk';

const projectRoot = path.resolve(__dirname, '..', '..');

interface TestFailure {
    title: string;
    error: string;
}

interface TestResults {
    passes: number;
    failures: number;
    failureDetails: TestFailure[];
}

async function main(): Promise<void> {
    // Start a static file server rooted at the project directory
    const server = http.createServer((req, res) => {
        return handler(req, res, { public: projectRoot });
    });

    await new Promise<void>((resolve) => server.listen(0, resolve));
    const address = server.address();
    const port = typeof address === 'object' && address !== null ? address.port : 0;
    const url = `http://localhost:${port}/test/browser/index.html`;

    let browser: Browser | undefined;
    try {
        browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
        const page = await browser.newPage();

        // Collect console output for debugging
        page.on('console', (msg) => {
            if (msg.type() === 'error') {
                console.error('[browser]', msg.text());
            }
        });

        await page.goto(url, { waitUntil: 'networkidle0' });

        // Wait for Mocha to finish (the #mocha-stats element appears when done)
        await page.waitForSelector('#mocha-stats', { timeout: 30000 });

        // Extract test results
        const results: TestResults = await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            const stats = document.querySelector('#mocha-stats')!;
            const passes = parseInt(stats.querySelector('.passes em')!.textContent!, 10);
            const failures = parseInt(stats.querySelector('.failures em')!.textContent!, 10);

            const failureDetails: { title: string; error: string }[] = [];

            // eslint-disable-next-line no-undef
            document.querySelectorAll('#mocha .test.fail').forEach((el) => {
                const title = el.querySelector('h2')!.textContent!;
                const error = el.querySelector('.error')?.textContent || '';
                failureDetails.push({ title, error });
            });

            return { passes, failures, failureDetails };
        });

        console.log(chalk.grey(`\nBrowser test results: ${results.passes} passing, ${results.failures} failing`));

        if (results.failures > 0) {
            console.error('\nFailed tests:');
            for (const f of results.failureDetails) {
                console.error(`  ${chalk.red('✗')} ${f.title}`);
                console.error(`    ${chalk.grey(f.error)}\n`);
            }
            process.exitCode = 1;
        } else {
            console.log(`${chalk.green('✔')} All browser tests passed`);
        }
    } catch (err) {
        console.error('Browser test runner error:', err);
        process.exitCode = 1;
    } finally {
        if (browser) await browser.close();
        server.close();
    }
}

void main();
