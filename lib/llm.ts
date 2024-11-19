import { ChatMessage } from "@langchain/core/messages";
import { ChatOpenAI } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";

const USER_PROMPT = `
Generate code for a web page that looks exactly like this.
`;

const HTML_TAILWIND_SYSTEM_PROMPT = `
You are an expert Tailwind developer
You take screenshots of a reference web page from the user, and then build single page apps
using Tailwind, HTML and JS.
You might also be given a screenshot(The second image) of a web page that you have already built, and asked to
update it to look more like the reference image(The first image).

- Make sure the app looks exactly like the screenshot.
- Pay close attention to background color, text color, font size, font family,
padding, margin, border, etc. Match the colors and sizes exactly.
- Use the exact text from the screenshot.
- Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code. WRITE THE FULL CODE.
- Repeat elements as needed to match the screenshot. For example, if there are 15 items, the code should have 15 items. DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.
- For images, use placeholder images from https://placehold.co and include a detailed description of the image in the alt text so that an image generation AI can generate the image later.
- You can use Font Awesome for icons.
- You can use Google Fonts

Return only the code in <div></div> tags.
Do NOT include markdown "\`\`\`" or "\`\`\`html" at the start or end.
`;

const HTML_CSS_SYSTEM_PROMPT = `
You are an expert CSS developer
You take screenshots of a reference web page from the user, and then build single page apps
using CSS, HTML and JS.
    You might also be given a screenshot(The second image) of a web page that you have already built, and asked to
update it to look more like the reference image(The first image).

- Make sure the app looks exactly like the screenshot.
- Pay close attention to background color, text color, font size, font family,
    padding, margin, border, etc.Match the colors and sizes exactly.
- Use the exact text from the screenshot.
- Do not add comments in the code such as "<!-- Add other navigation links as needed -->" and "<!-- ... other news items ... -->" in place of writing the full code.WRITE THE FULL CODE.
- Repeat elements as needed to match the screenshot.For example, if there are 15 items, the code should have 15 items.DO NOT LEAVE comments like "<!-- Repeat for each news item -->" or bad things will happen.
- For images, use placeholder images from https://placehold.co and include a detailed description of the image in the alt text so that an image generation AI can generate the image later.
- You can use Font Awesome for icons.
- You can use Google Fonts

Return only the full code in <html></html> tags.
Do NOT include markdown "\`\`\`" or "\`\`\`html" at the start or end.
`;

const SystemPrompts: {
    [key: string]: string;
} = Object.freeze({
    html_css: HTML_CSS_SYSTEM_PROMPT,
    html_tailwind: HTML_TAILWIND_SYSTEM_PROMPT,
});


export async function generateCodeStream(apiKey: string, model: string, apiEndpoint: string, image: string, stack: string, handleChunk: (output: string) => void): Promise<void> {
    const llm = new ChatOpenAI({
        model,
        apiKey,
        temperature: 0,
        configuration: {
            baseURL: apiEndpoint
        },
    });

    const systemPrompt = SystemPrompts[stack];

    if (!systemPrompt) {
        throw new Error(`Invalid stack: ${stack}`);
    }

    const userContent = [
        {
            type: "image_url",
            image_url: {
                url: image,
                detail: 'high'
            }
        },
        {
            type: 'text',
            text: USER_PROMPT
        }
    ];

    const messages = [
        new ChatMessage({
            role: 'system',
            content: systemPrompt
        }),
        new ChatMessage({
            role: 'user',
            content: userContent
        }),
    ];

    const parser = new StringOutputParser();
    const chain = llm.pipe(parser);
    for await (const chunk of await chain.stream(messages)) {
        handleChunk(chunk);
    }
}
