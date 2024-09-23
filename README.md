## emsdk リポジトリ側

C 言語のコード

```c
#include <emscripten.h>
#include <emscripten/console.h>

EMSCRIPTEN_KEEPALIVE
void hoge() {
    emscripten_console_log("Hello World");
}

int main() {
    return 0;
}
```

emscripten でのコンパイルコマンド

- `source ./emsdk_env.sh` で一時的にパス通してから実行

```bash
emcc hoge.c -o hoge.js -s NO_EXIT_RUNTIME=1 -s EXPORTED_FUNCTIONS='["_main", "_hoge"]' -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "print", "printErr"]' -s ENVIRONMENT=web -s USE_PTHREADS=0 -s MODULARIZE=1 -s EXPORT_ES6=0
```

生成された `hoge.js`, `hoge.wasm` をこのプロジェクトの `public/web_assemblies` 配下に移動させ、`script` に読み込ませる
