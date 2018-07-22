#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pymysql
import os
import yaml
import traceback
import sys
import argparse
reload(sys)
sys.setdefaultencoding('utf8')
# return menu id
def returnMenuId(table, code, level):
    sql = "select id from {table} where code = '{code}' and level = '{level}'".format(table=table,code=code, level=level)
    cursor.execute(sql)
    Id = cursor.fetchone()
    return Id
# judge menu exist
def judgeTrue(table, *args):
    if len(args) == 4:
      sql = "select id from {table} where {content}='{equaldata}' and {contentTwo}='{equaldataTwo}'".format(
        table=table,
        content=args[0],
        equaldata=args[1],
        contentTwo=args[2],
        equaldataTwo=args[3])
    else:
      sql = "select id from {table} where {content}='{equaldata}'".format(
        table=table,
        content=args[0],
        equaldata=args[1])
    cursor.execute(sql)
    count = cursor.execute(sql)
    # print count
    if count == 0:
        return True
    else:
        return False
# delete menu by menu_id
def deleteByMenuId(code, level):
    menuId = returnMenuId('iam_menu', code, level)
    sql = "delete from iam_menu_tl where id={menuId}".format(menuId=menuId["id"])
    cursor.execute(sql)
    sql = "delete from iam_menu_permission where menu_id={menuId}".format(menuId=menuId["id"])
    cursor.execute(sql)
    sql = "update iam_menu set parent_id=0 where parent_id='{parent_id}'".format(parent_id=menuId["id"])
    cursor.execute(sql)
    sql = "delete from iam_menu where id='{menuId}'".format(menuId=menuId["id"])
    cursor.execute(sql)

# return menu level
def returnLevel(data):
    dataMenu = data["menu"]
    centerLevel = []
    for service in dataMenu.keys():
        for level in levelArray:
            for saveLevel in dataMenu[service].keys():
                if saveLevel == level:
                    centerLevel.append(saveLevel)
    return centerLevel
# insert iam_menu
def insertMenuTable(table, data):
    try:
        dataMenu = data["menu"]
        dataLanguageChinese = data["language"]["Chinese"]
        for root in dataMenu:
                centerLevel = []
                for level in levelArray:
                    for service in dataMenu[root]:
                        if service == level:
                            centerLevel.append(service)
                for levelYaml in centerLevel:
                    if judgeTrue(table, 'code', root, 'level', levelYaml):
                        sql = "insert into {table} (code, name, level, parent_id, type, is_default, icon, sort) values ('{code}', '{name}', '{level}', 0, 'root', 1, '{icon}', '{sort}')".format(
                            table=table,
                            code=root,
                            name=dataLanguageChinese[root],
                            level=levelYaml,
                            icon=dataMenu[root]["icon"],
                            sort=dataMenu[root]["sort"])
                        cursor.execute(sql)
                    else:
                        sql = "update {table} set code='{code}', name='{name}', level='{level}', icon='{icon}'"
                        if attrs and ('sort' in attrs):
                            sql = sql + ", sort='{sort}'";
                        sql = (sql + " where code='{code}' and level='{level}'").format(
                            table=table,
                            code=root,
                            name=dataLanguageChinese[root],
                            level=levelYaml,
                            icon=dataMenu[root]["icon"],
                            sort=dataMenu[root]["sort"])
                        cursor.execute(sql)
        for service in dataMenu:
            centerLevel = []
            for level in levelArray:
                for saveLevel in dataMenu[service].keys():
                    if saveLevel == level:
                        centerLevel.append(saveLevel)
            for level in centerLevel:
                for menuList in dataMenu[service][level]:
                    sql = "select id from iam_menu where code='{service}' and level='{level}'".format(
                    service=service,
                    level=level)
                    count = cursor.execute(sql)
                    serviceId = cursor.fetchone()
                    if dataMenu[service][level][menuList]:
                        if judgeTrue(table, 'code', menuList):
                            if serviceId and ('id' in serviceId):
                                sql = "insert into {table} (code, name, level, parent_id, type, is_default, icon, route, sort) values ('{code}', '{name}', '{level}', '{parent_id}', 'menu', 1, '{icon}', '{route}', '{sort}')".format(
                                    table=table,
                                    code=menuList,
                                    name=dataLanguageChinese[menuList],
                                    level=level,
                                    parent_id=serviceId["id"],
                                    icon=dataMenu[service][level][menuList]["icon"],
                                    route=dataMenu[service][level][menuList]["Routes"],
                                    sort=dataMenu[service][level][menuList]["sort"])
                                cursor.execute(sql)
                        else:
                            if serviceId and ('id' in serviceId):
                                sql = "update {table} set code='{code}', name='{name}', level='{level}', icon='{icon}', route='{route}'"
                                if attrs and ('sort' in attrs):
                                    sql = sql + ", sort='{sort}'";
                                if attrs and ('parent_id' in attrs):
                                    sql = sql + ", parent_id='{parent_id}'";
                                sql = (sql + " where code='{code}' and level='{level}'").format(
                                    table=table,
                                    code=menuList,
                                    name=dataLanguageChinese[menuList],
                                    level=level,
                                    parent_id=serviceId["id"],
                                    icon=dataMenu[service][level][menuList]["icon"],
                                    route=dataMenu[service][level][menuList]["Routes"],
                                    sort=dataMenu[service][level][menuList]["sort"])
                                cursor.execute(sql)
    except:
        dealFault()
# insert iam_menu_permission
def insertMenuPermission(table, data):
    try:
        dataMenu = data["menu"]
        dataLanguageChinese = data["language"]["Chinese"]
        for service in dataMenu.keys():
            centerLevel = []
            for level in levelArray:
                for saveLevel in dataMenu[service].keys():
                    if saveLevel == level:
                        centerLevel.append(saveLevel)
            for level in centerLevel:
                for menuList in dataMenu[service][level].keys():
                    menuId = returnMenuId('iam_menu', menuList, level)
                    sql = "delete from {table} where menu_id={menuId}".format(table=table,menuId=menuId["id"])
                    cursor.execute(sql)
                    for permission in dataMenu[service][level][menuList]["permission"]:
                        if menuId:
                            sql = "select id from iam_menu_permission where menu_id={menuId} and permission_code='{permission_code}'".format(menuId=menuId["id"],permission_code=permission)
                            cursor.execute(sql)
                            count = cursor.execute(sql)
                            if count == 0:
                                sql = "insert into {table} (menu_id, permission_code) values ('{menuId}','{permission_code}')".format(table=table,menuId=menuId["id"],permission_code=permission)
                                cursor.execute(sql)
    except:
        dealFault()
# insert iam_menu_tl
def insertMenuTlTable(table, data):
    try:
        dataService = data["menu"]
        for service in dataService.keys():
            centerLevel = []
            for level in levelArray:
                for saveLevel in dataService[service].keys():
                    if saveLevel == level:
                        centerLevel.append(saveLevel)
            for level in centerLevel:
                for menuList in dataService[service][level].keys():
                    dataLanguageEnglish = data["language"]["English"]
                    dataLanguageChinese = data["language"]["Chinese"]
                    menuId = returnMenuId('iam_menu', menuList, level)
                    if menuId:
                        sql = "select id from {table} where id={menuId}".format(table=table,menuId=menuId["id"])
                        cursor.execute(sql)
                        count = cursor.execute(sql)
                        if count == 0:
                            insertMenuTl(table, 'en_US', menuId["id"], dataLanguageEnglish[menuList])
                            insertMenuTl(table, 'zh_CN', menuId["id"], dataLanguageChinese[menuList])
                        else:
                            updateMenuTl(table, 'en_US', menuId["id"], dataLanguageEnglish[menuList])
                            updateMenuTl(table, 'zh_CN', menuId["id"], dataLanguageChinese[menuList])
    except:
        dealFault()

# insert service menu tl
def insertServiceTlTable(table, data):
    try:
        dataService = data["menu"]
        for service in dataService.keys():
            dataLanguageEnglish = data["language"]["English"]
            dataLanguageChinese = data["language"]["Chinese"]
            for level in levelArray:
                sql = "select id from iam_menu where code='{service}' and level='{level}'".format(
                    service=service,
                    level=level)
                count = cursor.execute(sql)
                serviceId = cursor.fetchone()
                menuId = returnMenuId('iam_menu', service, level)
                if menuId:
                  sql = "select id from {table} where id={id}".format(
                      table=table,
                      id=menuId["id"])
                  count = cursor.execute(sql)
                  if count == 0:
                      insertMenuTl(table, 'en_US', menuId["id"], dataLanguageEnglish[service])
                      insertMenuTl(table, 'zh_CN', menuId["id"], dataLanguageChinese[service])
                  else:
                      updateMenuTl(table, 'en_US', menuId["id"], dataLanguageEnglish[service])
                      updateMenuTl(table, 'zh_CN', menuId["id"], dataLanguageChinese[service])
    except:
        dealFault()
def insertMenuTl(table, lang, id, name):
    sql = "insert into {table} (lang,id,name) values ('{lang}','{id}','{name}')".format(
        table=table,
        lang=lang,
        id=id,
        name=name)
    cursor.execute(sql)
def updateMenuTl(table, lang, id, name):
    sql = "update {table} set id='{id}', name='{name}' where id={id} and lang='{lang}'".format(
        table=table,
        lang=lang,
        id=id,
        name=name)
    cursor.execute(sql)

def deleteMenu(data):
    try:
        dataMenu = data["menu"]
        dataLanguageChinese = data["language"]["Chinese"]
        for root in dataMenu:
            centerLevel = []
            for level in levelArray:
              for service in dataMenu[root]:
                  if service == level:
                      centerLevel.append(service)
            for level in centerLevel:
                if "delete" in dataMenu[root] and (dataMenu[root]["delete"] == True):
                    deleteByMenuId(root, level)

        for service in dataMenu:
            centerLevel = []
            for level in levelArray:
                for saveLevel in dataMenu[service].keys():
                    if saveLevel == level:
                        centerLevel.append(saveLevel)
            for level in centerLevel:
                for menuList in dataMenu[service][level]:
                    if "delete" in dataMenu[service][level][menuList] and dataMenu[service][level][menuList]["delete"] == True:
                        deleteByMenuId(menuList, level)
    except:
        dealFault()

    
def dealFault():
    traceback.print_exc()
    db.rollback()
def close():
    cursor.close()
    db.close()
if __name__ == '__main__':
    levelArray = ["site", "organization", "project", "user"]
    baseDirs = os.path.abspath(os.path.join(os.path.dirname("__file__")))
    wholeConfig = '{baseDirs}/config.yml'.format(baseDirs=baseDirs);
    ymlFile = open(wholeConfig)
    contentConfig = yaml.load(ymlFile)

    parser = argparse.ArgumentParser()
    parser.add_argument('-i','--ip', help='databse host', dest="host", default="localhost")
    parser.add_argument('-p','--port', type=int, help='databse port', dest="port", default=3306)
    parser.add_argument('-u','--user', help='databse user', dest="user", default="choerodon")
    parser.add_argument('-s','--secret', help='databse password', dest="passwd", default="123456")
    parser.add_argument('-a','--attrs', help='enable update attrs, it can include sort & parent_id, you can use "port,parent_id" to update menu attrs', dest="attrs", default="")
    parser.add_argument('-d','--delete', type=bool, help='enable delete menu', dest="delete", default=False)
    args = parser.parse_args()

    host = os.environ.get('DB_HOST') if os.environ.get('DB_HOST') else args.host
    port = os.environ.get('DB_PORT') if os.environ.get('DB_PORT') else args.port
    user = os.environ.get('DB_USER') if os.environ.get('DB_USER') else args.user
    passwd = os.environ.get('DB_PASS') if os.environ.get('DB_PASS') else args.passwd
    attrs = os.environ.get('UP_ATTRS') if os.environ.get('UP_ATTRS') else args.attrs
    delete = os.environ.get('ENABLE_DELETE') if os.environ.get('ENABLE_DELETE') else args.delete

    config = {
        'host': host,
        'port': int(port),
        'user': user,
        'passwd': passwd,
        'charset':'utf8',
        'cursorclass':pymysql.cursors.DictCursor
        }
    db = pymysql.connect(**config)
    db.autocommit(1)
    cursor = db.cursor()
    DB_NAME = os.getenv("DB_NAME", "iam_service")
    db.select_db(DB_NAME)
    insertMenuTable('iam_menu', contentConfig)
    insertMenuTlTable('iam_menu_tl', contentConfig)
    insertServiceTlTable('iam_menu_tl', contentConfig)
    insertMenuPermission('iam_menu_permission', contentConfig)
    if delete == True:
        deleteMenu(contentConfig)
    ymlFile.close()