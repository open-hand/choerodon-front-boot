#!/usr/bin/env python
# -*- coding: utf-8 -*-
import traceback
import sys
reload(sys)
sys.setdefaultencoding('utf8')

class Menu(object):
    levelArray = ["site", "organization", "project", "user"]
    db = {}
    cursor = {}
    attrs = ""

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

    def insertMenuTl(self, table, lang, id, name):
        sql = "INSERT INTO {table} (LANG, ID, NAME) VALUES ('{lang}','{id}','{name}')".format(
            table=table,
            lang=lang,
            id=id,
            name=name)
        self.cursor.execute(sql)
    def updateMenuTl(self, table, lang, id, name):
        sql = "UPDATE {table} SET ID='{id}', NAME='{name}' WHERE ID={id} AND LANG='{lang}'".format(
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