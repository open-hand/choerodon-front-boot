#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pymysql
import os
import yaml
import traceback
import sys
import getopt
reload(sys)
sys.setdefaultencoding('utf8')
# 返回id
def returnTableId(table, content, equaldata):
    sql = "select id from {table} where {content} = '{equaldata}'".format(table=table,content=content, equaldata=equaldata)
    cursor.execute(sql)
    Id = cursor.fetchone()
    return Id
# 判断是否存在
def judgeTrue(table, content, equaldata):
    sql = "select id from {table} where {content} = '{equaldata}'".format(table=table,content=content, equaldata=equaldata)
    cursor.execute(sql)
    count = cursor.execute(sql)
    if count == 0:
        return True
    else:
        return False
# 添加服务表数据
def selectServiceTable(table, data):
    try:
        db.select_db(DB_NAME)
        dataMenu = data["menu"]
        for keys in dataMenu.keys():
            if judgeTrue('service', 'code', keys):
                if judgeTrue('icon', 'icon_code', data["menu"][keys]["icon"]):
                    sql = "insert into icon (icon_code) values ('{code}')".format(code=data["menu"][keys]["icon"])
                    cursor.execute(sql)
                iconId = returnTableId('icon', 'icon_code',  data["menu"][keys]["icon"])
                if iconId and ('id' in iconId):
                    sql = "insert into {table} (code, name, icon_id, service_type, groups, devops_service_code) values ('{code}','{name}','{iconId}','{serviceType}','{groups}', '{devops_service_code}')".format(table=table, code=keys,
                    name=data["language"]["Chinese"][keys],iconId=iconId["id"],serviceType=data["kind"],groups=data["group"],devops_service_code=data["code"])
                    cursor.execute(sql)
            else:
                iconId = returnTableId('icon', 'icon_code',  data["menu"][keys]["icon"])
                if iconId and ('id' in iconId):
                    sql = "update {table} set code='{code}', name='{name}', icon_id='{iconId}', service_type='{serviceType}', groups='{groups}',devops_service_code='{devops_service_code}' where code='{code}'".format(
                        table=table,
                        code=keys,
                        name=data["language"]["Chinese"][keys],
                        iconId=iconId["id"],
                        serviceType=data["kind"],
                        groups=data["group"],
                        devops_service_code=data["code"])
                    cursor.execute(sql)
    except:
        dealFault()
# 插入菜单
def selectMenuTable(table, data):
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
                    serviceId = returnTableId('service', 'code',  service)
                    if dataMenu[service][level][menuList]:
                        if judgeTrue('icon', 'icon_code', dataMenu[service][level][menuList]["icon"]):
                            sql = "insert into icon (icon_code) values ('{code}')".format(code=dataMenu[service][level][menuList]["icon"])
                            cursor.execute(sql)
                        iconId = returnTableId('icon', 'icon_code',  dataMenu[service][level][menuList]["icon"])
                        if judgeTrue(table, 'code', menuList):
                            if serviceId and iconId and ('id' in serviceId) and ('id' in iconId):
                                sql = "insert into {table} (code, name, menu_level, service_id, is_dir, icon_id,service_group,service_code,route_map) values ('{code}','{Name}', '{menu_level}','{service_id}','{is_dir}','{icon_id}', '{service_group}', '{service_code}', '{route_map}')".format(
                                    table=table,
                                    code=menuList,
                                    Name=dataLanguageChinese[menuList],
                                    menu_level=level,
                                    service_id=serviceId["id"],
                                    is_dir=0,
                                    icon_id=iconId["id"],
                                    service_group=data["group"],
                                    service_code=data["code"],
                                    route_map=dataMenu[service][level][menuList]["Routes"])
                                cursor.execute(sql)
                        else:
                            if serviceId and iconId and ('id' in serviceId) and ('id' in iconId):
                                sql = "update {table} set code='{code}', name='{name}', menu_level='{menu_level}', service_id='{service_id}', is_dir='{is_dir}', icon_id='{icon_id}',service_group='{service_group}',service_code='{service_code}',route_map='{route_map}' where code='{code}'".format(
                                    table=table,
                                    code=menuList,
                                    name=dataLanguageChinese[menuList],
                                    menu_level=level,
                                    service_id=serviceId["id"],
                                    is_dir=0,
                                    icon_id=iconId["id"],
                                    service_group=data["group"],
                                    service_code=data["code"],
                                    route_map=dataMenu[service][level][menuList]["Routes"])
                                cursor.execute(sql)
    except:
        dealFault()
# 菜单中英文
def selectMenuTlTable(table, data):
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
                    menuId = returnTableId('menu', 'code',  menuList)
                    if menuId:
                        sql = "select id from {table} where id={menuId}".format(table=table,menuId=menuId["id"])
                        cursor.execute(sql)
                        count = cursor.execute(sql)
                        if count == 0:
                            sql = "insert into {table} (lang,id,name) values ('en_US','{id}','{Name}')".format(table=table,id=menuId["id"], Name=dataLanguageEnglish[menuList])
                            cursor.execute(sql)
                            sql = "insert into {table} (lang,id,name) values ('zh_CN','{id}','{Name}')".format(table=table,id=menuId["id"], Name=dataLanguageChinese[menuList])
                            cursor.execute(sql)
                        else:
                            sql = "update {table} set lang='en_US',id='{id}',name='{Name}' where id={id} and lang='en_US'".format(
                                    table=table,id=menuId["id"], Name=dataLanguageEnglish[menuList])
                            cursor.execute(sql)
                            sql = "update {table} set lang='zh_CN',id='{id}',name='{Name}' where id={id} and lang='zh_CN'".format(
                                    table=table,id=menuId["id"], Name=dataLanguageChinese[menuList])
                            cursor.execute(sql)
    except:
        dealFault()
# 服务中英文
def selectServiceTlTable(table, data):
    try:
        dataService = data["menu"]
        for service in dataService.keys():
            dataLanguageEnglish = data["language"]["English"]
            dataLanguageChinese = data["language"]["Chinese"]
            serviceId = returnTableId('service', 'code',  service)
            if serviceId:
                sql = "select id from service_tl where id={serviceId}".format(serviceId=serviceId["id"],
                    Name=dataLanguageEnglish[service])
                count = cursor.execute(sql)
                if count == 0:
                    sql = "insert into {table} (lang,id,name) values ('en_US','{id}','{Name}')".format(
                        table=table,
                        id=serviceId["id"],
                        Name=dataLanguageEnglish[service])
                    cursor.execute(sql)
                    sql = "insert into {table} (lang,id,name) values ('zh_CN','{id}','{Name}')".format(table=table,id=serviceId["id"], Name=dataLanguageChinese[service])
                    cursor.execute(sql)
                else:
                    sql = "update {table} set lang='en_US',id='{id}',name='{Name}' where id={id} and lang='en_US'".format(
                        table=table,
                        id=serviceId["id"],
                        Name=dataLanguageEnglish[service])
                    cursor.execute(sql)
                    sql = "update {table} set lang='zh_CN',id='{id}',name='{Name}' where id={id} and lang='zh_CN'".format(table=table,id=serviceId["id"], Name=dataLanguageChinese[service])
                    cursor.execute(sql)
    except:
        dealFault()
# 菜单权限插入
def menuPermission(table, data):
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
                    menuId = returnTableId('menu', 'code', menuList)
                    sql = "delete from {table} where menu_id={menuId}".format(table=table,menuId=menuId["id"])
                    cursor.execute(sql)
                    for permission in dataMenu[service][level][menuList]["permission"]:
                        permissionId = returnTableId('permission', 'name', permission)
                        if menuId and permissionId:
                            sql = "select id from iam_menu_permission where menu_id={menuId} and permission_id={permissionId}".format(menuId=menuId["id"],permissionId=permissionId["id"])
                            cursor.execute(sql)
                            count = cursor.execute(sql)
                            if count == 0:
                                sql = "insert into {table} (menu_id, permission_id) values ('{menuId}','{permissionId}')".format(table=table,menuId=menuId["id"],permissionId=permissionId["id"])
                                cursor.execute(sql)
    except:
        dealFault()
def dealFault():
    traceback.print_exc()
    db.rollback()
def close():
    cursor.close()
    db.close()
if __name__ == '__main__':
    levelArray = ["site","organization", "project", "user"]
    baseDirs = os.path.abspath(os.path.join(os.path.dirname("__file__")))
    wholeConfig = '{baseDirs}/config.yml'.format(baseDirs=baseDirs)
    ymlFile = open(wholeConfig)
    contentConfig = yaml.load(ymlFile)
    host=os.environ.get('DB_HOST')
    port=os.environ.get('DB_PORT')
    user=os.environ.get('DB_USER')
    passwd=os.environ.get('DB_PASS')
    try:
        options,args = getopt.getopt(sys.argv[1:],"p:i:u:s:", ["ip=","port=","user=","secret="])
    except getopt.GetoptError:
        sys.exit()
    for name,value in options:
        if name in ("-i","--ip"):
            host=value
        if name in ("-p","--port"):
            port=value
        if name in ("-u","--user"):
            user=value
        if name in ("-s","--secret"):
            passwd=value
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
    DB_NAME = 'hap_user_service'
    selectServiceTable('service', contentConfig)
    selectServiceTlTable('service_tl', contentConfig)
    selectMenuTable('menu', contentConfig)
    selectMenuTlTable('menu_tl', contentConfig)
    menuPermission('iam_menu_permission', contentConfig)
    ymlFile.close()
