import { StreamerSongListWatcher } from "./StreamerSongListWatcher";
import TwitchDonoWatcher from "./TwitchChatEventSource";

console.log({ version: 1.0 });
new TwitchDonoWatcher().run();
try {
  new StreamerSongListWatcher().run();
} catch (err) {
  console.error(err);
}
