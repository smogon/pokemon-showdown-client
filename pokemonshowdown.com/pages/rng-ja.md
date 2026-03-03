# RNG
# 正しいRNGを誤っていると感じる理由

あらゆるランダム性のあるゲームでは、乱数生成器(RNG)が良くない、悪い数値を生成している、といった不満が挙がります。しかし、シミュレータでポケモンをプレイすると、さらに悪い結果になる要因が数多くあります。

1. Switchや3DSに比べて、シミュレーターではゲームの進行が速いので、プレイ回数が増え、ランダム性が高まります。
2. より多くの人がプレイしています。毎日50万回以上の対戦が行われています。100万分の1の確率の出来事が毎日1回起こっています。信じられないような低い確率でも、数が多いだけで常に発生しているのです。
3. 人間はランダム性を理解するのが苦手です。数多くの科学的研究により、人間はランダムな分布が実際の挙動とは全く違うものだと捉えていることが示されています。[Numerous scientific studies show that humans think random distributions work completely differently from how they actually work.][1]

  [1]: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5933241/


## PSのRNGの仕組み

Pokémon Showdownでは、Switchや3DSで発売されている実際のポケモンゲームが使用しているのと全く同じ種類のRNGを使用しています。

ソースコードはここから確認できます:[pokemon-showdown/prng.ts at master - smogon/pokemon-showdown - GitHub](https://github.com/smogon/Pokemon-Showdown/blob/master/sim/prng.ts)

また、これがSwitchや3DSで使われているのと同じ乱数生成器であることを記録したページもたくさんあります。

[Pesudorandom number generation in Pokémon - Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Pseudorandom_number_generation)

そして、これが完全に正常なRNGの使用であることを示す多くのページがあります。

[線形合同法 - Wikipedia](https://ja.wikipedia.org/wiki/%E7%B7%9A%E5%BD%A2%E5%90%88%E5%90%8C%E6%B3%95)

上記のコードとは異なるソースコードを使用していると思うのであれば、いつでも自分でテストすることができます。

バトルの終了後、そのリプレイを保存すると、ランダムseedを含むインプットログも保存されます。ランダムバトルの場合は、リプレイページのHTMLソースから直接ログを取得できます。ランダム以外のチームを使用するバトルでは、プライバシーの観点からseedは表示されません。対戦相手から許可を得て`/exportinputlog`コマンドを使用する必要があります。

ログを取得したら、GitHubから公開されているソースコードを使って再生してみると、Switchや3DSと同じRNGであることが読み取れて証明されます。

## 補足

RNGがなくても、ランダム性のあるゲームをデザインすることは可能です。じゃんけんを例に考えます：じゃんけんは「ランダム」ですが、それはRNGのせいではありません―全てのランダム性はプレイヤーによるものです。
残念ながら、ポケモンはこのようなデザインではありません―文句は私ではなくゲームフリークに言ってください。:p
