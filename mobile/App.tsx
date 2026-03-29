import React, { useEffect, useRef } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Platform, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CircleUserRound, PlusCircle, Users } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function App() {
  const letters = ['T', 'A', 'M', 'B', 'O', 'L', 'A'];

  // Animation values
  const letterAnims = useRef(letters.map(() => new Animated.Value(0))).current;
  const fadeUpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Define drop animations for letters
    const dropAnimations = letterAnims.map((anim) =>
      Animated.spring(anim, {
        toValue: 1,
        tension: 40,
        friction: 5,
        useNativeDriver: true,
      })
    );

    // Run staggered drop
    Animated.stagger(120, dropAnimations).start(() => {
      // After letters finish, fade up the rest
      Animated.timing(fadeUpAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(164, 244, 182, 0.4)', '#FEFBEA', 'rgba(255, 226, 169, 0.3)']}
        start={{ x: 0.1, y: 0.2 }}
        end={{ x: 0.9, y: 0.8 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Text style={styles.logoText}>Tambola </Text>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.titleContainer}>
            {letters.map((letter, i) => {
              const translateY = letterAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: [-300, 0] // Drop from top
              });
              const opacity = letterAnims[i];

              // Alternating rotation simulating the CSS version
              const rotateVal = i % 2 === 0 ? '4deg' : '-4deg';
              const rotate = letterAnims[i].interpolate({
                inputRange: [0, 1],
                outputRange: ['-20deg', rotateVal]
              });

              return (
                <Animated.Text
                  key={i}
                  style={[
                    styles.titleLetter,
                    { transform: [{ translateY }, { rotate }], opacity }
                  ]}
                >
                  {letter}
                </Animated.Text>
              );
            })}
          </View>

          <Animated.View style={{
            opacity: fadeUpAnim,
            transform: [{
              translateY: fadeUpAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0]
              })
            }],
            alignItems: 'center'
          }}>
            <Text style={styles.subtitle}>
              The high-stakes social game of numbers, luck, and community.
              Play with friends or join players worldwide in the most vibrant lobby.
            </Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity style={[styles.btn, styles.btnCreate]} activeOpacity={0.8}>
                <PlusCircle size={20} color="white" />
                <Text style={styles.btnCreateText}>Create Room</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.btn, styles.btnJoin]} activeOpacity={0.8}>
                <Users size={20} color="#0f461d" />
                <Text style={styles.btnJoinText}>Join Room</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>

        <TouchableOpacity style={styles.profileButton} activeOpacity={0.8}>
          <CircleUserRound size={28} color="#1a7631" />
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFBEA',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 60,
    zIndex: 10,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1a7631',
    fontStyle: 'italic',
  },
  navActions: {
    flexDirection: 'row',
  },
  icon: {
    marginLeft: 16,
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
    marginTop: -40,
  },
  titleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  titleLetter: {
    fontSize: width * 0.14, // Responsive text size
    fontWeight: '900',
    color: '#1a7631',
    fontStyle: 'italic',
    textShadowColor: '#114c20',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 1,
    marginHorizontal: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#5e6b5f',
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  btnCreate: {
    backgroundColor: '#1a7631',
  },
  btnCreateText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  btnJoin: {
    backgroundColor: '#a4f4b6',
  },
  btnJoinText: {
    color: '#0f461d',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  profileButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20,
  }
});
