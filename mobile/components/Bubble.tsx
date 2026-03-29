import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';

interface BubbleProps {
  num: number;
  bottom?: string | number;
  top?: string | number;
  left?: string | number;
  right?: string | number;
  size: number;
  delay: number;
}

const Bubble = ({ num, bottom, top, left, right, size, delay }: BubbleProps) => {
  const [isBurst, setIsBurst] = useState(false);

  // Animated values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // Particle animations
  const particleAnims = useRef(Array.from({ length: 8 }).map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Initial mount animation (grow)
    Animated.sequence([
      Animated.delay(delay * 1000), // Delay in ms
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          tension: 80,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        })
      ])
    ]).start();

    // Loop floating animation
    const runFloat = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(floatAnim, {
            toValue: -15,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(floatAnim, {
            toValue: 0,
            duration: 2000 + Math.random() * 1000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          })
        ])
      ).start();
    };
    
    // Slight random start delay for floating so they aren't synced
    setTimeout(runFloat, Math.random() * 1000);
  }, []);

  const handlePress = () => {
    if (isBurst) return;
    setIsBurst(true);

    // Zoom out slightly then pop to 0
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start();

    // Animate particles out and fade
    Animated.parallel(
      particleAnims.map((anim) => 
        Animated.timing(anim, {
          toValue: 1,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        })
      )
    ).start();

    // Reset after 5s
    setTimeout(() => {
      particleAnims.forEach(anim => anim.setValue(0));
      setIsBurst(false);
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }).start();
    }, 5000);
  };

  const getPositionStyle = () => {
    const style: any = {};
    if (bottom !== undefined) style.bottom = bottom;
    if (top !== undefined) style.top = top;
    if (left !== undefined) style.left = left;
    if (right !== undefined) style.right = right;
    return style;
  };

  return (
    <View style={[styles.container, getPositionStyle(), { width: size, height: size }]}>
      {!isBurst && (
        <Animated.View
          style={[
            styles.bubbleWrapper,
            {
              opacity: opacityAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: floatAnim }
              ]
            }
          ]}
        >
          <Pressable onPress={handlePress} style={styles.bubble}>
            <Text style={[styles.bubbleText, { fontSize: size * 0.4 }]}>{num}</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Particles handling */}
      {isBurst && particleAnims.map((anim, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const dist = size * 0.8;
        const translateX = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.cos(angle) * dist]
        });
        const translateY = anim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, Math.sin(angle) * dist]
        });
        const pScale = anim.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1, 0] // Shrink at the end
        });

        return (
          <Animated.View
            key={`p-${i}`}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: size * 0.15,
              height: size * 0.15,
              marginLeft: -(size * 0.15) / 2,
              marginTop: -(size * 0.15) / 2,
              backgroundColor: '#1a7631',
              borderRadius: size * 0.15,
              transform: [
                { translateX },
                { translateY },
                { scale: pScale }
              ]
            }}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 50,
  },
  bubbleWrapper: {
    width: '100%',
    height: '100%',
  },
  bubble: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1a7631',
    borderRadius: 999,
    borderWidth: 4,
    borderColor: '#114c20',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  bubbleText: {
    color: 'white',
    fontWeight: '900',
    fontStyle: 'italic',
  }
});

export default Bubble;
