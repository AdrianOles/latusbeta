import React from "react";
import { View, Image, Text } from "react-native";
import { school } from "../..";
import { CardMove } from "../../Sharegame";
import colors from "../../../../colors";

type Game = {
    homeTeam: string;
    awayTeam: string;
    homeScore: string;
    awayScore: string;
}

const schoolLogos = {
    "St. Thomas Aquinas": require('../../../../../assets/schools/sta.png'),
    "St. Ignatius of Loyola": require('../../../../../assets/schools/loy.png'),
    "Notre Dame": require('../../../../../assets/schools/nd.png'),
    "Bishop Reding": require('../../../../../assets/schools/br.png'),
    "Holy Trinity": require('../../../../../assets/schools/ht.png'),
    "Assumption": require('../../../../../assets/schools/as.png'),
    "Corpus Christi": require('../../../../../assets/schools/cc.png'),
    "St. Francis Xavier": require('../../../../../assets/schools/stfx.png'),
    "St. Kateri Tekakwitha": require('../../../../../assets/schools/stk.png'),
    "Christ the King": require('../../../../../assets/schools/ctk.png'),
};

const StackText = React.memo(({ variant, move, game }: { variant?: boolean, move: CardMove, game: Game }) => {
    const { homeTeam, awayTeam, homeScore, awayScore } = game;

    return (
        <View style={{
            position: 'absolute', backgroundColor: variant ? '#000000B2' : 'transparent',
            bottom: move.bottom, right: move.right, top: move.top, left: move.left, zIndex: 1,
        }}>
            <Text style={{ color: 'white', fontFamily: 'Figtree-Bold', textAlign: 'right' }}>{homeTeam} {homeScore}</Text>
            <Text style={{ color: 'white', opacity: 0.65, fontFamily: 'Figtree-Bold', textAlign: 'right' }}>{awayTeam} {awayScore}</Text>
        </View>
    );
})

export default StackText;