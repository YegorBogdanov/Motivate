import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator, } from '@react-navigation/bottom-tabs';
import {
  BottomNavigation,
  BottomNavigationTab,
  Icon,
} from '@ui-kitten/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ROUTES } from '../routes';
import { HomeStackScreen } from '../HomeStack/HomeStack';
import { StatsStackScreen } from '../StatsStack';
import { QuoteStackScreen } from '../QuoteStack';
import Profile from '../../components/Profile';
import { vectorIcons, kittenIcons } from '../../assets/icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';

const { Navigator, Screen } = createBottomTabNavigator();

const BottomTabBar = ({ navigation, state }) => {
  const { bottom } = useSafeAreaInsets();
  return (
    <BottomNavigation
      style={{
        paddingBottom: bottom,
        paddingTop: 8,
        backgroundColor: '#162050',
      }}
      selectedIndex={state.index}
      onSelect={(index) => navigation.navigate(state.routeNames[index])}
    >
      <BottomNavigationTab icon={kittenIcons.HomeOutline} title="HOME" />
      <BottomNavigationTab icon={kittenIcons.PieChart} title="STATS" />
      <BottomNavigationTab icon={kittenIcons.QuoteIcon} title="QUOTE" />
      <BottomNavigationTab icon={kittenIcons.profile} title="PROFILE" />
    </BottomNavigation>
  );
};

const TabNavigator = () => {
  return (
    <Navigator tabBar={(props) => <BottomTabBar {...props} />}>
      <Screen name={ROUTES.homeTab} component={HomeStackScreen} />
      <Screen name={ROUTES.stats} component={StatsStackScreen} />
      <Screen name={ROUTES.quote} component={QuoteStackScreen} />
      <Screen name={ROUTES.profile} component={Profile} />
    </Navigator>
  );
};

export default TabNavigator;
