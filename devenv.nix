{ pkgs, lib, config, inputs, ... }:

{
  packages = [ pkgs.git ];

  languages = {
    javascript = {
      enable = true;
      package = pkgs.nodejs_24;
      npm.enable = true;
      pnpm = {
        enable = true;
      };
      corepack.enable = true;
    };
  };

  processes.serve = {
    exec = "pnpm run dev";
    cwd = "doc";
  };

  enterShell = ''
    cd $DEVENV_ROOT/doc
    pnpm install
  '';
}
