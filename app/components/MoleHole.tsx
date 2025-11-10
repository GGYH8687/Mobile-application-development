import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';

type Props = {
    index: number;
    isActive: boolean;
    onHit: (index: number) => void;
    disabled?: boolean;
};

export default function MoleHole({ index, isActive, onHit, disabled }: Props) {
    const translateY = useRef(new Animated.Value(30)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isActive) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        } else {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 30,
                    duration: 200,
                    useNativeDriver: true
                }),
                Animated.timing(opacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();
        }
    }, [isActive]);

    return (
        <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
                if (!disabled && isActive) onHit(index);
            }}
            style={styles.holeWrapper}
        >
            <Animated.View
                style={[
                    styles.hole,
                    {
                        transform: [{ translateY }],
                        opacity
                    }
                ]}
            >
                {isActive ? <Text style={styles.mole}>🐹</Text> : <Text style={styles.empty} />}
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    holeWrapper: {
        width: 90,
        height: 90,
        margin: 6,
        alignItems: 'center',
        justifyContent: 'flex-end'
    },
    hole: {
        width: 82,
        height: 82,
        borderRadius: 41,
        backgroundColor: '#6B4C2C',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    mole: {
        fontSize: 36
    },
    empty: {
        fontSize: 18,
        color: 'transparent'
    }
});
