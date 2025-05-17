import icons from "./icons";
import images from "./images";

import { Share, Alert } from 'react-native';

const handleShare = async () => {
  try {
    const result = await Share.share({
      message: 'Hey! Check out this awesome app: https://github.com/cherryindian/RootWise',
      title: 'Join me on RootWise',
    });

    if (result.action === Share.sharedAction) {
      console.log('Link shared successfully!');
    } else if (result.action === Share.dismissedAction) {
      console.log('Share dismissed');
    }
  } catch (error) {
    Alert.alert('Error', 'Failed to share the link.');
    console.error(error);
  }
};

import { Linking } from 'react-native';

const handleSendEmail = () => {
  const to = "rootwisebiz@gmail.com";
  const subject = "Need help with the app";
  const body = "Hi team,\n\nI need help with...";

  const emailUrl = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  Linking.openURL(emailUrl).catch((err) => {
    Alert.alert("Error", "Could not open the email app");
    console.error(err);
  });
};

export const categories = [
  {
    title: 'All',
    category: 'All'
  }
]

function handleRating() {
  const formUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfM7nSiVneBhlnU_iLQxmf0tBHpGgPN1zljLcxPJY_HWUwYpg/viewform?usp=header";
  Linking.openURL(formUrl).catch((err) => {
    Alert.alert("Error", "Could not open the rating form");
    console.error(err);
  });
}

export const settings = [
  {
    title: "Help Center",
    icon: icons.info,
    onPress: handleSendEmail,
  },
  {
    title: "Invite Friends",
    icon: icons.people,
    onPress: handleShare,
  },
  {
    title: "Rate Us",
    icon: icons.star,
    onPress: handleRating,
  }
];


