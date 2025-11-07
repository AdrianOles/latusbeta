import React from "react";
import { View, Image, Text } from "react-native";
import { school } from "../..";
import { CardMove } from "../../Sharegame";
import colors from "../../../../colors";
import Svg, { Path } from "react-native-svg";

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

const HorizontalBox = React.memo(({ variant, move, game }: { variant?: boolean, move: CardMove, game: Game }) => {
    const { homeTeam, awayTeam, homeScore, awayScore } = game;

    return (
        <View style={{
            position: 'absolute', backgroundColor: variant ? '#000000B2' : 'transparent', width: variant ? 160 : 120, height: 40,
            zIndex: 1, bottom: move.bottom, right: move.right, top: move.top, left: move.left
        }}>
            <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', position: 'relative', flex: 1, }}>
                <View style={{ backgroundColor: variant ? colors.schools[homeTeam as school]["dark"].primary : 'transparent', flex: 1, height: '100%' }}>
                    <Image
                        source={schoolLogos[homeTeam as school]}
                        style={{ aspectRatio: 1, height: '60%', alignSelf: 'center', marginVertical: 'auto', objectFit: 'contain' }}
                    />
                </View>
                <View style={{ flex: 1, backgroundColor: variant ? colors.schools[homeTeam as school]["dark"].primary : 'transparent', height: '100%', position: 'relative' }}>
                    <Text style={{
                        color: 'white', textAlign: 'center', fontFamily: "Figtree-Bold", fontSize:
                            26, opacity: 0.65, marginVertical: 'auto', zIndex: 2
                    }}>{homeScore}</Text>
                    {variant && <View style={{ width: '100%', height: '100%', backgroundColor: '#00000040', zIndex: 1, position: 'absolute' }} />}
                </View>
                <View style={{ height: '40%', width: 2, backgroundColor: '#FFFFFF40', position: 'absolute', left: '50%' }} />
                <View style={{ flex: 1, backgroundColor: variant ? colors.schools[awayTeam as school]["dark"].primary : 'transparent', height: '100%' }}>
                    <Text style={{ color: 'white', textAlign: 'center', fontFamily: "Figtree-Bold", fontSize: 26, marginVertical: 'auto', zIndex: 2 }}>{awayScore}</Text>
                    {variant && <View style={{ width: '100%', height: '100%', backgroundColor: '#00000040', zIndex: 1, position: 'absolute' }} />}
                </View>
                <View style={{ backgroundColor: variant ? colors.schools[awayTeam as school]["dark"].primary : 'transparent', height: '100%', flex: 1 }}>
                    <Image
                        source={schoolLogos[awayTeam as school]}
                        style={{ aspectRatio: 1, height: '60%', alignSelf: 'center', marginVertical: 'auto', objectFit: 'contain' }}
                    />
                </View>
            </View>
        </View>
    );
})

export default HorizontalBox;