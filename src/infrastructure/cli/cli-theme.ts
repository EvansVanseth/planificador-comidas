import pc from 'picocolors';

export const theme = {
  error: (msg: string) => pc.red('✗ ') + msg,
  success: (msg: string) => pc.green('✓ ') + msg,
  header: (msg: string) => pc.cyan(pc.bold(msg)),
  dim: (msg: string) => pc.dim(msg),
  highlight: (msg: string) => pc.yellow(msg),
  errorMsg: (msg: string) => pc.red(msg),
  successMsg: (msg: string) => pc.green(msg),
};
