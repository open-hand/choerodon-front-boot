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
def returnTableId(table, content, equaldata):
    sql = "select ID from {table} where {content} = '{equaldata}'".format(table=table,content=content, equaldata=equaldata)
    cursor.execute(sql)
    Id = cursor.fetchone()
    return Id
# judge menu exist
def judgeTrue(table, code, level):
    sql = "select ID from {table} where CODE='{code}' and FD_LEVEL='{level}' and TYPE='dir'".format(
        table=table,
        code=code,
        level=level)
    cursor.execute(sql)
    count = cursor.execute(sql)
    parent_id = cursor.fetchone()
    if parent_id:
        return parent_id["ID"]
    else:
        return 0

def getParentId(table, code, level):
    sql = "select ID from {table} where CODE='{code}' and FD_LEVEL='{level}'".format(
        table=table,
        code=code,
        level=level)
    cursor.execute(sql)
    count = cursor.execute(sql)
    parent_id = cursor.fetchone()
    if parent_id:
        return parent_id["ID"]
    else:
        return 0

# insert iam_menu
def insertDir(table, data):
    try:
        dirMenu = data
        for dir in data:
            dirId = judgeTrue(table, dir["code"], dir["level"]);
            if dirId == 0:
                parent = getParentId(table, dir["parent"], dir["level"])
                sql = "insert into {table} (CODE, NAME, FD_LEVEL, PARENT_ID, TYPE, IS_DEFAULT, ICON, SORT) values ('{code}', '{name}', '{level}', {parent_id}, 'dir', 0, '{icon}', '{sort}')".format(
                          table=table,
                          code=dir["code"],
                          name=dir["name"],
                          level=dir["level"],
                          icon=dir["icon"],
                          sort=dir["sort"],
                          parent_id=parent)
                cursor.execute(sql)
                dirId = cursor.lastrowid
                sql = "insert into IAM_MENU_TL (ID, LANG, NAME) values ('{id}', '{lang}', '{name}')".format(
                    id=dirId,
                    lang="zh_CN",
                    name=dir["name"]
                )
                cursor.execute(sql)
                sql = "insert into IAM_MENU_TL (ID, LANG, NAME) values ('{id}', '{lang}', '{name}')".format(
                    id=dirId,
                    lang="en_US",
                    name=dir["enName"]
                )
                cursor.execute(sql)                
            for sub in dir["subMenu"]:
                sql = "update {table} set PARENT_ID = {dir_id} where CODE='{subCode}'".format(
                    table=table,
                    dir_id=dirId,
                    subCode=sub)
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
    baseDirs = os.path.abspath(os.path.join(os.path.dirname("__file__")))
    wholeConfig = '{baseDirs}/dirMenu.yml'.format(baseDirs=baseDirs);
    ymlFile = open(wholeConfig)
    contentConfig = yaml.load(ymlFile)

    parser = argparse.ArgumentParser()
    parser.add_argument('-i','--ip', help='databse host', dest="host", default="localhost")
    parser.add_argument('-p','--port', type=int, help='databse port', dest="port", default=3306)
    parser.add_argument('-u','--user', help='databse user', dest="user", default="choerodon")
    parser.add_argument('-s','--secret', help='databse password', dest="passwd", default="123456")
    args = parser.parse_args()

    host = os.environ.get('DB_HOST') if os.environ.get('DB_HOST') else args.host
    port = os.environ.get('DB_PORT') if os.environ.get('DB_PORT') else args.port
    user = os.environ.get('DB_USER') if os.environ.get('DB_USER') else args.user
    passwd = os.environ.get('DB_PASS') if os.environ.get('DB_PASS') else args.passwd

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
    insertDir('IAM_MENU', contentConfig)

    ymlFile.close()