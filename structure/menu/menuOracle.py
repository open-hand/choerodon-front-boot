#!/usr/bin/env python
# -*- coding: utf-8 -*-
import cx_Oracle
import os
import logging
from Menu import Menu

class MenuOracle(Menu):
    levelArray = ["site", "organization", "project", "user"]
    db = {}
    cursor = {}
    attrs = ""

    def __init__(self, config, schema, attrs):
        os.environ['NLS_LANG'] = 'SIMPLIFIED CHINESE_CHINA.UTF8'
        config["dsn"] = cx_Oracle.makedsn(host=config["host"], port=config["port"], sid=config["sid"])
        self.db = cx_Oracle.connect(user=config["user"], password=config["password"], dsn=config["dsn"])   #用自己的实际数据库用户名、密码、主机ip地址 替换即可
        self.db.current_schema = schema
        self.db.autocommit = 1
        self.cursor = self.db.cursor()
        self.attrs = attrs

    # judge menu exist
    def judgeTrue(self, table, *args):
        if len(args) == 4:
          sql = "SELECT COUNT(ID) FROM {table} WHERE {content}='{equaldata}' AND {contentTwo}='{equaldataTwo}'".format(
            table=table,
            content=args[0],
            equaldata=args[1],
            contentTwo=args[2],
            equaldataTwo=args[3])
        else:
          sql = "SELECT COUNT(ID) FROM {table} WHERE {content}='{equaldata}'".format(
            table=table,
            content=args[0],
            equaldata=args[1])
        self.cursor.execute(sql)
        logging.debug("sql: [" + sql + "]")
        count = self.cursor.fetchone()
        return count[0] == 0

    # delete menu by menu_id
    def deleteByMenuId(self, code, level):
        menuId = self.returnMenuId('IAM_MENU', code, level)
        if menuId:
            sql = "DELETE FROM IAM_MENU_TL WHERE ID={menuId}".format(menuId=menuId[0])
            self.cursor.execute(sql)
            logging.debug("sql: [" + sql + "]")

            sql = "DELETE FROM IAM_MENU_PERMISSION WHERE MENU_ID={menuId}".format(menuId=menuId[0])
            self.cursor.execute(sql)
            logging.debug("sql: [" + sql + "]")

            sql = "UPDATE IAM_MENU SET PARENT_ID=0 WHERE PARENT_ID='{parent_id}'".format(parent_id=menuId[0])
            self.cursor.execute(sql)
            logging.debug("sql: [" + sql + "]")

            sql = "DELETE FROM IAM_MENU WHERE ID='{menuId}'".format(menuId=menuId[0])
            self.cursor.execute(sql)
            logging.debug("sql: [" + sql + "]")

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
                            sql = "INSERT INTO {table} (ID, CODE, NAME, FD_LEVEL, PARENT_ID, TYPE, IS_DEFAULT, ICON, SORT) VALUES (IAM_MENU_S.nextval, '{code}', '{name}', '{level}', 0, 'root', 1, '{icon}', '{sort}')".format(
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
                                if serviceId:
                                    sql = "INSERT INTO {table} (ID, CODE, NAME, FD_LEVEL, PARENT_ID, TYPE, IS_DEFAULT, ICON, ROUTE, SORT) VALUES (IAM_MENU_S.nextval, '{code}', '{name}', '{level}', '{parent_id}', 'menu', 1, '{icon}', '{route}', '{sort}')".format(
                                        table=table,
                                        code=menuList,
                                        name=dataLanguageChinese[menuList],
                                        level=level,
                                        parent_id=serviceId[0],
                                        icon=dataMenu[service][level][menuList]["icon"],
                                        route=dataMenu[service][level][menuList]["Routes"],
                                        sort=dataMenu[service][level][menuList]["sort"])
                                    self.cursor.execute(sql)
                                    logging.debug("sql: [" + sql + "]")
                            else:
                                if serviceId:
                                    sql = "UPDATE {table} SET CODE='{code}', NAME='{name}', FD_LEVEL='{level}', ICON='{icon}', ROUTE='{route}'"
                                    if self.attrs and ('sort' in self.attrs):
                                        sql = sql + ", SORT='{sort}'";
                                    if self.attrs and ('parent_id' in self.attrs):
                                        sql = sql + ", PARENT_ID='{parent_id}'";
                                    sql = (sql + " WHERE CODE='{code}' AND FD_LEVEL='{level}'").format(
                                        table=table,
                                        code=menuList,
                                        name=dataLanguageChinese[menuList],
                                        level=level,
                                        parent_id=serviceId[0],
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
                        sql = "DELETE FROM {table} WHERE MENU_ID={menuId}".format(table=table,menuId=menuId[0])
                        self.cursor.execute(sql)
                        for permission in dataMenu[service][level][menuList]["permission"]:
                            if menuId:
                                sql = "SELECT COUNT(ID) FROM {table} WHERE MENU_ID={menuId} AND PERMISSION_CODE='{permission_code}'".format(
                                    table=table,
                                    menuId=menuId[0],
                                    permission_code=permission)
                                self.cursor.execute(sql)
                                logging.debug("sql: [" + sql + "]")

                                count = self.cursor.fetchone()
                                if count[0] == 0:
                                    sql = "INSERT INTO {table} (ID, MENU_ID, PERMISSION_CODE) VALUES (IAM_PERMISSION_S.nextval, '{menuId}','{permission_code}')".format(
                                        table=table,
                                        menuId=menuId[0],
                                        permission_code=permission)
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
                            sql = "SELECT COUNT(ID) FROM {table} WHERE ID={menuId}".format(table=table,menuId=menuId[0])
                            self.cursor.execute(sql)
                            logging.debug("sql: [" + sql + "]")

                            count = self.cursor.fetchone()
                            if count[0] == 0:
                                self.insertMenuTl(table, 'en_US', menuId[0], dataLanguageEnglish[menuList])
                                self.insertMenuTl(table, 'zh_CN', menuId[0], dataLanguageChinese[menuList])
                            else:
                                self.updateMenuTl(table, 'en_US', menuId[0], dataLanguageEnglish[menuList])
                                self.updateMenuTl(table, 'zh_CN', menuId[0], dataLanguageChinese[menuList])
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
                      sql = "SELECT COUNT(ID) FROM {table} WHERE ID={id}".format(
                          table=table,
                          id=menuId[0])
                      self.cursor.execute(sql)
                      logging.debug("sql: [" + sql + "]")
                      
                      count = self.cursor.fetchone()
                      if count[0] == 0:
                          self.insertMenuTl(table, 'en_US', menuId[0], dataLanguageEnglish[service])
                          self.insertMenuTl(table, 'zh_CN', menuId[0], dataLanguageChinese[service])
                      else:
                          self.updateMenuTl(table, 'en_US', menuId[0], dataLanguageEnglish[service])
                          self.updateMenuTl(table, 'zh_CN', menuId[0], dataLanguageChinese[service])
        except:
            self.dealFault()