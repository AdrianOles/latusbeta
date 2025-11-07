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

const SimpleBox = React.memo(({ variant, move, game }: { variant?: boolean, move: CardMove, game: Game }) => {
    const { homeTeam, awayTeam, homeScore, awayScore } = game;

    return (
        <View style={{
            position: 'absolute', backgroundColor: '#000000B2', width: 100, height: 100,
            bottom: move.bottom, right: move.right, top: move.top, left: move.left, zIndex: 1
        }}>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'relative', flex: 1 }}>
                <View style={{ backgroundColor: colors.schools[homeTeam as school]["dark"].primary, flex: 1, height: '100%' }}>
                    <Image
                        source={schoolLogos[homeTeam as school]}
                        style={{ aspectRatio: 1, height: '70%', alignSelf: 'center', marginVertical: 'auto', objectFit: 'contain' }}
                    />
                </View>
                <View style={{ flex: 1, backgroundColor: variant ? colors.schools[homeTeam as school]["dark"].primary : 'transparent', height: '100%' }}>
                    <Text style={{ color: 'white', textAlign: 'center', fontFamily: "Figtree-Bold", fontSize: 26, opacity: 0.65, marginVertical: 'auto' }}>{homeScore}</Text>
                </View>
            </View>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'relative', flex: 1 }}>
                <View style={{ backgroundColor: colors.schools[awayTeam as school]["dark"].primary, height: '100%', flex: 1 }}>
                    <Image
                        source={schoolLogos[awayTeam as school]}
                        style={{ aspectRatio: 1, height: '70%', alignSelf: 'center', marginVertical: 'auto', objectFit: 'contain' }}
                    />
                </View>
                <View style={{ flex: 1, backgroundColor: variant ? colors.schools[awayTeam as school]["dark"].primary : 'transparent', height: '100%' }}>
                    <Text style={{ color: 'white', textAlign: 'center', fontFamily: "Figtree-Bold", fontSize: 26, marginVertical: 'auto' }}>{awayScore}</Text>
                </View>
            </View>
        </View>
    );
})

export default SimpleBox;