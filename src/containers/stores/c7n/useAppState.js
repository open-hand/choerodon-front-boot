import React, { useContext } from 'react';
import Store from './AppProvider';

function useAppState() {
  const { AppState } = useContext(Store);

  const {
    menuType, expanded, guideExpanded, useInfo, siteInfo, isUser,
    getUserId, getDebugger, setDebugger, getType, getUserInfo,
    setUserInfo, setSiteInfo, getSiteInfo, getMenuExpanded, setMenuExpanded,
    getGuideExpanded, setGuideExpanded, currentLanguage, isAuth, currentMenuType,
    setAuthenticated, changeMenuType, setTypeUser, isTypeUser,
    loadUserInfo, loadSiteInfo,
  } = AppState;

  return {
    menuType,
    expanded,
    guideExpanded,
    useInfo,
    siteInfo,
    isUser,
    getUserId,
    getDebugger,
    setDebugger,
    getType,
    getUserInfo,
    setUserInfo,
    setSiteInfo,
    getSiteInfo,
    getMenuExpanded,
    setMenuExpanded,
    getGuideExpanded,
    setGuideExpanded,
    currentLanguage,
    isAuth,
    currentMenuType,
    setAuthenticated,
    changeMenuType,
    setTypeUser,
    isTypeUser,
    loadUserInfo,
    loadSiteInfo,
  };
}

export default useAppState;
