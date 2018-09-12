#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pymysql
import os
import traceback
import sys
reload(sys)
sys.setdefaultencoding('utf8')

class MenuMysql:
    
    levelArray = ["site", "organization", "project", "user"]
    db = {}
    cursor = {}
    attrs = ""
    def __init__(self, config, schema, attrs):
        dbConfig = {
            'charset': 'utf8',
            'cursorclass': pymysql.cursors.DictCursor
        }
        dbConfig=dict(dbConfig.items()+config.items())
        self.db = pymysql.connect(**dbConfig)
        self.db.autocommit(1)
        self.db.select_db(schema)
        self.cursor = self.db.cursor()
        self.attrs = attrs

    # return menu id
    def returnMenuId(self, table, code, level):
        sql = "SELECT ID FROM {table} WHERE CODE = '{code}' AND FD_LEVEL = '{level}'".format(table=table,code=code, level=level)
        self.cursor.execute(sql)
        Id = self.cursor.fetchone()
        return Id
    # judge menu exist
    def judgeTrue(self, table, *args):
        if len(args) == 4:
          sql = "SELECT ID FROM {table} WHERE {content}='{equaldata}' AND {contentTwo}='{equaldataTwo}'".format(
            table=table,
            content=args[0],
            equaldata=args[1],
            contentTwo=args[2],
            equaldataTwo=args[3])
        else:
          sql = "SELECT ID FROM {table} WHERE {content}='{equaldata}'".format(
            table=table,
            content=args[0],
            equaldata=args[1])
        self.cursor.execute(sql)
        count = self.cursor.execute(sql)
        return count == 0

    # delete menu by menu_id
    def deleteByMenuId(self, code, level):
        menuId = self.returnMenuId('IAM_MENU', code, level)
        if menuId:
            sql = "DELETE FROM IAM_MENU_TL WHERE ID={menuId}".format(menuId=menuId["ID"])
            self.cursor.execute(sql)
            sql = "DELETE FROM IAM_MENU_PERMISSION WHERE MENU_ID={menuId}".format(menuId=menuId["ID"])
            self.cursor.execute(sql)
            sql = "UPDATE IAM_MENU SET PARENT_ID=0 WHERE PARENT_ID='{parent_id}'".format(parent_id=menuId["ID"])
            self.cursor.execute(sql)
            sql = "DELETE FROM IAM_MENU WHERE ID='{menuId}'".format(menuId=menuId["ID"])
            self.cursor.execute(sql)

    # return menu level
    def returnLevel(self, data):
        dataMenu = data["menu"]
        centerLevel = []
        for service in dataMenu.keys():
            for level in self.levelArray:
                for saveLevel in dataMenu[service].keys():
                    if saveLevel == level:
                        centerLevel.append(saveLevel)
        return centerLevel
    # insert IAM_MENU
    def insertMenuTable(self, table, data):
        try:
            dataMenu = data["menu"]
            dataLanguageChinese = data["language"]["Chinese"]
            for root in dataMenu:
                    centerLevel = []
                    for level in self.levelArray:
                        for service in dataMenu[root]:
                            if service == level:
                                centerLevel.append(service)
                    for levelYaml in centerLevel:
                        if self.judgeTrue(table, 'CODE', root, 'FD_LEVEL', levelYaml):
                            sql = "INSERT INTO {table} (CODE, NAME, FD_LEVEL, PARENT_ID, TYPE, IS_DEFAULT, ICON, SORT) VALUES ('{code}', '{name}', '{level}', 0, 'root', 1, '{icon}', '{sort}')".format(
                                table=table,
                                code=root,
                                name=dataLanguageChinese[root],
                                level=levelYaml,
                                icon=dataMenu[root]["icon"],
                                sort=dataMenu[root]["sort"])
                            self.cursor.execute(sql)
                        else:
                            sql = "UPDATE {table} SET CODE='{code}', NAME='{name}', FD_LEVEL='{level}', ICON='{icon}'"
                            if self.attrs and ('sort' in self.attrs):
                                sql = sql + ", SORT='{sort}'";
                            sql = (sql + " WHERE CODE='{code}' AND FD_LEVEL='{level}'").format(
                                table=table,
                                code=root,
                                name=dataLanguageChinese[root],
                                level=levelYaml,
                                icon=dataMenu[root]["icon"],
                                sort=dataMenu[root]["sort"])
                            self.cursor.execute(sql)
            for service in dataMenu:
                centerLevel = []
                for level in self.levelArray:
                    for saveLevel in dataMenu[service].keys():
                        if saveLevel == level:
                            centerLevel.append(saveLevel)
                for level in centerLevel:
                    for menuList in dataMenu[service][level]:
                        serviceId = self.returnMenuId(table, service, level)
                        if dataMenu[service][level][menuList]:
                            if self.judgeTrue(table, 'CODE', menuList):
                                if serviceId and ('ID' in serviceId):
                                    sql = "INSERT INTO {table} (CODE, NAME, FD_LEVEL, PARENT_ID, TYPE, IS_DEFAULT, ICON, ROUTE, SORT) VALUES ('{code}', '{name}', '{level}', '{parent_id}', 'menu', 1, '{icon}', '{route}', '{sort}')".format(
                                        table=table,
                                        code=menuList,
                                        name=dataLanguageChinese[menuList],
                                        level=level,
                                        parent_id=serviceId["ID"],
                                        icon=dataMenu[service][level][menuList]["icon"],
                                        route=dataMenu[service][level][menuList]["Routes"],
                                        sort=dataMenu[service][level][menuList]["sort"])
                                    self.cursor.execute(sql)
                            else:
                                if serviceId and ('ID' in serviceId):
                                    sql = "UPDATE {table} set CODE='{code}', NAME='{name}', FD_LEVEL='{level}', ICON='{icon}', ROUTE='{route}'"
                                    if self.attrs and ('sort' in self.attrs):
                                        sql = sql + ", SORT='{sort}'";
                                    if self.attrs and ('parent_id' in self.attrs):
                                        sql = sql + ", PARENT_ID='{parent_id}'";
                                    sql = (sql + " WHERE CODE='{code}' AND FD_LEVEL='{level}'").format(
                                        table=table,
                                        code=menuList,
                                        name=dataLanguageChinese[menuList],
                                        level=level,
                                        parent_id=serviceId["ID"],
                                        icon=dataMenu[service][level][menuList]["icon"],
                                        route=dataMenu[service][level][menuList]["Routes"],
                                        sort=dataMenu[service][level][menuList]["sort"])
                                    self.cursor.execute(sql)
        except:
            self.dealFault()
    # insert IAM_MENU_PERMISSION
    def insertMenuPermission(self, table, data):
        try:
            dataMenu = data["menu"]
            dataLanguageChinese = data["language"]["Chinese"]
            for service in dataMenu.keys():
                centerLevel = []
                for level in self.levelArray:
                    for saveLevel in dataMenu[service].keys():
                        if saveLevel == level:
                            centerLevel.append(saveLevel)
                for level in centerLevel:
                    for menuList in dataMenu[service][level].keys():
                        menuId = self.returnMenuId('IAM_MENU', menuList, level)
                        sql = "DELETE FROM {table} WHERE MENU_ID={menuId}".format(table=table,menuId=menuId["ID"])
                        self.cursor.execute(sql)
                        for permission in dataMenu[service][level][menuList]["permission"]:
                            if menuId:
                                sql = "SELECT ID FROM IAM_MENU_PERMISSION WHERE MENU_ID={menuId} AND PERMISSION_CODE='{permission_code}'".format(menuId=menuId["ID"],permission_code=permission)
                                self.cursor.execute(sql)
                                count = self.cursor.execute(sql)
                                if count == 0:
                                    sql = "INSERT INTO {table} (MENU_ID, PERMISSION_CODE) VALUES ('{menuId}','{permission_code}')".format(table=table,menuId=menuId["ID"],permission_code=permission)
                                    self.cursor.execute(sql)
        except:
            self.dealFault()
    # insert IAM_MENU_TL
    def insertMenuTlTable(self, table, data):
        try:
            dataService = data["menu"]
            for service in dataService.keys():
                centerLevel = []
                for level in self.levelArray:
                    for saveLevel in dataService[service].keys():
                        if saveLevel == level:
                            centerLevel.append(saveLevel)
                for level in centerLevel:
                    for menuList in dataService[service][level].keys():
                        dataLanguageEnglish = data["language"]["English"]
                        dataLanguageChinese = data["language"]["Chinese"]
                        menuId = self.returnMenuId('IAM_MENU', menuList, level)
                        if menuId:
                            sql = "SELECT ID FROM {table} WHERE ID={menuId}".format(table=table,menuId=menuId["ID"])
                            self.cursor.execute(sql)
                            count = self.cursor.execute(sql)
                            if count == 0:
                                self.insertMenuTl(table, 'en_US', menuId["ID"], dataLanguageEnglish[menuList])
                                self.insertMenuTl(table, 'zh_CN', menuId["ID"], dataLanguageChinese[menuList])
                            else:
                                self.updateMenuTl(table, 'en_US', menuId["ID"], dataLanguageEnglish[menuList])
                                self.updateMenuTl(table, 'zh_CN', menuId["ID"], dataLanguageChinese[menuList])
        except:
            self.dealFault()

    # insert service menu tl
    def insertServiceTlTable(self, table, data):
        try:
            dataService = data["menu"]
            for service in dataService.keys():
                dataLanguageEnglish = data["language"]["English"]
                dataLanguageChinese = data["language"]["Chinese"]
                for level in self.levelArray:
                    menuId = self.returnMenuId('IAM_MENU', service, level)
                    if menuId:
                      sql = "SELECT ID FROM {table} WHERE ID={id}".format(
                          table=table,
                          id=menuId["ID"])
                      count = self.cursor.execute(sql)
                      if count == 0:
                          self.insertMenuTl(table, 'en_US', menuId["ID"], dataLanguageEnglish[service])
                          self.insertMenuTl(table, 'zh_CN', menuId["ID"], dataLanguageChinese[service])
                      else:
                          self.updateMenuTl(table, 'en_US', menuId["ID"], dataLanguageEnglish[service])
                          self.updateMenuTl(table, 'zh_CN', menuId["ID"], dataLanguageChinese[service])
        except:
            self.dealFault()
    def insertMenuTl(self, table, lang, id, name):
        sql = "INSERT INTO {table} (LANG, ID, NAME) VALUES ('{lang}','{id}','{name}')".format(
            table=table,
            lang=lang,
            id=id,
            name=name)
        self.cursor.execute(sql)
    def updateMenuTl(self, table, lang, id, name):
        sql = "UPDATE {table} set ID='{id}', NAME='{name}' WHERE ID={id} AND LANG='{lang}'".format(
            table=table,
            lang=lang,
            id=id,
            name=name)
        self.cursor.execute(sql)

    def deleteMenu(self, data):
        try:
            dataMenu = data["menu"]
            dataLanguageChinese = data["language"]["Chinese"]
            for root in dataMenu:
                centerLevel = []
                for level in self.levelArray:
                  for service in dataMenu[root]:
                      if service == level:
                          centerLevel.append(service)
                for level in centerLevel:
                    if "delete" in dataMenu[root] and (dataMenu[root]["delete"] == True):
                        self.deleteByMenuId(root, level)

            for service in dataMenu:
                centerLevel = []
                for level in self.levelArray:
                    for saveLevel in dataMenu[service].keys():
                        if saveLevel == level:
                            centerLevel.append(saveLevel)
                for level in centerLevel:
                    for menuList in dataMenu[service][level]:
                        if "delete" in dataMenu[service][level][menuList] and dataMenu[service][level][menuList]["delete"] == True:
                            self.deleteByMenuId(menuList, level)
        except:
            self.dealFault()


    def dealFault(self):
        traceback.print_exc()
        self.db.rollback()
    def close(self):
        self.cursor.close()
        self.db.close()