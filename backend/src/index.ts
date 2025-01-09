import app from './api';

interface Env {}
export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    console.log('cron processed');
  },

  async fetch(request: Request, env: any) {
    return await app.fetch(request, env);
  },
};
