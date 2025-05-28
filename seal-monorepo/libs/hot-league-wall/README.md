# Sedie Client Demo


| Project | Node |
|---------|------|
| seal-monorepo/saba-games | v20.9.0 |
| seal-monorepo | v18.20.2 |


-   yarn install
-   yarn run dev (SG/VG), or
-   yarn run dev-gn (xD)

## Demo page

-   SG/VG : https://l1-sedie-client-demo1.lumigame.com/token
-   xD: https://gn-core-client-demo.lumigame.com/token

```bash
## 還原 npm registry
## npm set registry https://registry.npmjs.org/
npm set registry http://npm.lumigame.com
yarn add @sg/sg-game-client
yarn add @sg/sg-observer
yarn add reflect-metadata
yarn add mobx
yarn add axios
```

```
upgrade to 1.1.1
[ O ] public
[ O ] _shared
[ O ] games
[ O ] i18n
[ O ] main.scss
[] lobby
[] main.scss , 
[] root

[] vip-sedie header
[] lobby scss




* 目前每次重新載入，初始狀態都是 stopGameLoop -> 再切換到目前狀態(如 placingBet ...)
* roundState: stopGameLoop , clientRoundId: 3575940
* roundState: placingBet , clientRoundId: 3575941
* 為了配合計時器同時切換狀態，更換 roundId 需要延遲兩秒
* 只有當載入次數大於等於 2 時才延遲
```