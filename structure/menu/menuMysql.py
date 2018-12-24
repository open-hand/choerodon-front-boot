#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pymysql
import logging
from Menu import Menu

class MenuMysql(Menu):
    
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
                            logging.debug("sql: [" + sql + "]")
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
                            logging.debug("sql: [" + sql + "]")
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
                                    logging.debug("sql: [" + sql + "]")
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
                                    logging.debug("sql: [" + sql + "]")
        except:
            self.dealFault()
    # insert IAM_MENU_PERMISSION
    def insertMenuPermission(self, table, data):
        try:
            dataMenu = data["menu"]
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
                                logging.debug("sql: [" + sql + "]")

                                count = self.cursor.execute(sql)
                                if count == 0:
                                    sql = "INSERT INTO {table} (MENU_ID, PERMISSION_CODE) VALUES ('{menuId}','{permission_code}')".format(table=table,menuId=menuId["ID"],permission_code=permission)
                                    self.cursor.execute(sql)
                                    logging.debug("sql: [" + sql + "]")
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
                            logging.debug("sql: [" + sql + "]")

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
                        logging.debug("sql: [" + sql + "]")

                        count = self.cursor.execute(sql)
                        if count == 0:
                            self.insertMenuTl(table, 'en_US', menuId["ID"], dataLanguageEnglish[service])
                            self.insertMenuTl(table, 'zh_CN', menuId["ID"], dataLanguageChinese[service])
                        else:
                            self.updateMenuTl(table, 'en_US', menuId["ID"], dataLanguageEnglish[service])
                            self.updateMenuTl(table, 'zh_CN', menuId["ID"], dataLanguageChinese[service])
        except:
            self.dealFault()

    def insertDir(self, data):
        try:
            table = "IAM_MENU"
            for dir in data:
                if "delete" in dir and (dir["delete"] == True):
                    continue
                
                dirId = self.judgeTrueForDir(table, dir["code"], dir["level"])
                if dirId == 0:
                    parent = self.returnMenuId(table, dir["parent"], dir["level"])
                    if parent == None or ('ID' not in parent):
                        continue
                    sql = "INSERT INTO {table} (CODE, NAME, FD_LEVEL, PARENT_ID, TYPE, IS_DEFAULT, ICON, SORT) VALUES ('{code}', '{name}', '{level}', {parent_id}, 'dir', 0, '{icon}', '{sort}')".format(
                        table=table,
                        code=dir["code"],
                        name=dir["name"],
                        level=dir["level"],
                        icon=dir["icon"],
                        sort=dir["sort"],
                        parent_id=parent["ID"])
                    self.cursor.execute(sql)
                    logging.debug("sql: [" + sql + "]")

                    dirId = self.cursor.lastrowid
                    self.insertMenuTl("IAM_MENU_TL", 'en_US', dirId, dir["enName"])
                    self.insertMenuTl("IAM_MENU_TL", 'zh_CN', dirId, dir["name"])
                    
                for sub in dir["subMenu"]:
                    sql = "UPDATE {table} SET PARENT_ID = {dir_id} WHERE CODE='{subCode}'".format(
                        table=table,
                        dir_id=dirId,
                        subCode=sub)
                    self.cursor.execute(sql)
                    logging.debug("sql: [" + sql + "]")
        except:
            self.dealFault()