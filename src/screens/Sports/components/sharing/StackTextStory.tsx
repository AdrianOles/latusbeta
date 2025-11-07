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

const StackTextStory = React.memo(({ variant, move, game }: { variant?: boolean, move: CardMove, game: Game }) => {
    const { homeTeam, awayTeam, homeScore, awayScore } = game;

    return (
        <View style={{zIndex: 1, height: '100%', justifyContent: 'center', paddingRight: 16}}>
            <Text style={{ color: 'white', fontFamily: 'Figtree-Bold', textAlign: 'right', fontSize: 16 }}>{homeTeam} {homeScore}</Text>
            <Text style={{ color: 'white', opacity: 0.65, fontFamily: 'Figtree-Bold', textAlign: 'right', fontSize: 16 }}>{awayTeam} {awayScore}</Text>
        </View>
    );
})

export default StackTextStory;