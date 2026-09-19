{ pkgs, lib, config, inputs, ... }:

{
  packages = [ pkgs.git ];

  languages = {
    javascript = {
      enable = true;
      package = pkgs.nodejs-slim_26;
      pnpm = {
        enable = true;
        package = pkgs.pnpm_12;
      };
      bun = {
        enable = true;
      };
    };
  };

  processes.serve = {
    exec = "pnpm run dev";
    cwd = "doc";
  };

  tasks = {
    "api:check" = {
      exec = ''
        pnpm run spectral
        pnpm run lint
        pnpm run scalar-lint
        pnpm run check-format
      '';
      cwd = "doc";
    };
  };
}
