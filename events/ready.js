import { logReady } from '../helpers/logger.js';

export default client => {
    logReady(`Logged in as ${client.user.tag}`);
};
