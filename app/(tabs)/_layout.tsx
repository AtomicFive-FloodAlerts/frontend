import useTheme from '@/hooks/useTheme';
import { Ionicons, } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

const TabsLayout = () => {
    const {colors} =  useTheme();
  return (
    <Tabs
         screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
             backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            height: 70,
            paddingTop: 10,
            paddingBottom: 0,
        },
        tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "bold",
        },  
        headerShown: false,
    }}>
        <Tabs.Screen 
            name="index"
            options={{ 
                title: "Home" , 
                tabBarIcon: ({color, size}) => (
                    <Ionicons name="list" size={size} color={color} />
                )
            }}
            />
        <Tabs.Screen 
                    name="danger"
                    options={{ 
                          title: "Danger Zones" , 
                        tabBarIcon: ({color, size}) => (
                            <Ionicons name="alert-circle" size={size} color={color} />
                        )
                    }}
                    />
        <Tabs.Screen
            name="report"
            options={{
                href: null,
        }}
        />
        <Tabs.Screen 
                    name="settings"
                    options={{
                            title: "Settings" ,
                            tabBarIcon: ({color, size}) => (
                                <Ionicons name="cog-outline" size={size} color={color} />
                            )
                        }}
                    />

    
      
    </Tabs>
  )
}

export default TabsLayout