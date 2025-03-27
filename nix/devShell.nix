{ pkgs, lib, ... }:
pkgs.mkShell {
  packages =
    [
      pkgs.nodejs_23
    ]
    ++ (lib.mapAttrsToList (k: v: pkgs.writeShellScriptBin k v) {

      pnpm = "corepack pnpm \$@";
      pnpx = "corepack pnpx \$@";
    });

}
