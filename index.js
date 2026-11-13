import React from "react";

import { registerRootComponent } from "expo";

import { PaperProvider } from "react-native-paper";

import App from "./App";

import { temaInka } from "./src/theme/temaInka";

function Main() {
  return (
    <PaperProvider theme={temaInka}>
      <App />
    </PaperProvider>
  );
}

registerRootComponent(Main);
