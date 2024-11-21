import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
    extensionApi: 'chrome',
    modules: ['@wxt-dev/module-react'],
    manifest: {
        permissions: ['activeTab', 'storage'],
        host_permissions: ['<all_urls>'],
        action: {},
        commands: {
            "select-UI": {
                description: "Select UI on the page to clone",
                suggested_key: {
                    default: "Alt+Shift+S"
                }
            }
        }
    }
});
