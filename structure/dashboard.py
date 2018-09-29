#!/usr/bin/env python
# _*_ coding:utf-8 _*_

import json
import pymysql
import os
import yaml
import traceback
import sys
import getopt
reload(sys)
import argparse

sys.setdefaultencoding('utf8')
content = {}
baseDirs = os.path.abspath(os.path.join(os.path.dirname("__file__")))
pathDir = {
    "dashboardDirs": '{baseDirs}/{value}/src/app/{value}/config/dashboard/dashboard.yml',
    "languageEnDir": '{baseDirs}/{value}/src/app/{value}/config/dashboard/language/en.yml',
    "languagezhDir": '{baseDirs}/{value}/src/app/{value}/config/dashboard/language/zh.yml',
}
newPathDir = {
    "wholeConfig": '{baseDirs}/dashboard.yml'
}

# write dashboard yml file
def writeYml(modules, newPathDir, language=None):
    dashboardYml(modules, pathDir["dashboardDirs"])
    # 文件整合
    whole = {
        "dashboard": dashboardYml(modules, pathDir["dashboardDirs"]),
        "language": {
            "English": languageYml(modules, pathDir["languageEnDir"]),
            "Chinese": languageYml(modules, pathDir["languagezhDir"]),
        }
    }
    ymlString = newPathDir.format(baseDirs = baseDirs, language = language)
    ymlFile = open(ymlString, 'w+')
    ymlFile.write(json.dumps(whole))
    ymlFile.close()

# get dir
def adjustString(dirString, value=None):
    endString = dirString.format(baseDirs = baseDirs, value = value)
    return endString

# get yml data
def adjustContent(modules, dirName):
    for i in modules:
        ymlFile = open(adjustString(dirName, i))
        content[i] = yaml.load(ymlFile)
    return content
# get dashboard yml data
def dashboardYml(modules, path):
    centerObj = {}
    dashboardContent = adjustContent(modules, path)
    for i in modules:
        for k in dashboardContent[i]["dashboard"]:
            code = '{namespace}/{code}'.format(namespace = i, code = k["code"])
            k["namespace"] = i
            centerObj[code] = k
    return centerObj

# get dashboard tl yml data
def languageYml(modules, languageDir):
    centerObj = {}
    languageContent = adjustContent(modules, languageDir)
    for i in modules:
        for k in languageContent[i].keys():
            code = '{namespace}/{code}'.format(namespace = i, code = k)
            centerObj[code] = languageContent[i][k]
    return centerObj


def insertDb():
    wholeConfig = newPathDir["wholeConfig"].format(baseDirs=baseDirs);
    ymlFile = open(wholeConfig)
    contentConfig = yaml.load(ymlFile)
    insertDashboard(contentConfig)
    insertDashbaordTl(contentConfig)
    insertDashboardRole(contentConfig)
    cursor.close()
    db.close()
    ymlFile.close()

def returnId(table, code, namespace):
    sql = "SELECT ID FROM {table} WHERE CODE='{code}' AND NAMESPACE='{namespace}'".format(table=table, code=code, namespace=namespace)
    cursor.execute(sql)
    Id = cursor.fetchone()
    return Id

def insertDashboard(data):
    try:
        dashboards = data["dashboard"]
        dataLanguageChinese = data["language"]["Chinese"]
        table = "IAM_DASHBOARD"
        for i in dashboards:
            dashboard = dashboards[i]
            Id = returnId(table, dashboard["code"], dashboard["namespace"])
            if Id:
                sql = "UPDATE {table} SET CODE='{code}', FD_LEVEL='{level}', ICON='{icon}', SORT='{sort}', NAMESPACE='{namespace}'"
                sql = (sql + " WHERE CODE='{code}' AND FD_LEVEL='{level}'").format(
                    table=table,
                    code=dashboard["code"],
                    namespace=dashboard["namespace"],
                    level=dashboard["level"],
                    icon=dashboard["icon"],
                    sort=dashboard["sort"])
                cursor.execute(sql)
            else:
                sql = "INSERT INTO {table} (CODE, NAME, FD_LEVEL, TITLE, DESCRIPTION, ICON, NAMESPACE, SORT) VALUES ('{code}', '{name}', '{level}', '{title}', '{description}', '{icon}', '{namespace}', '{sort}')"
                sql = sql.format(
                    table=table,
                    code=dashboard["code"],
                    name=dataLanguageChinese[i],
                    level=dashboard["level"],
                    title=dashboard["title"],
                    description=dashboard["description"],
                    icon=dashboard["icon"],
                    namespace=dashboard["namespace"],
                    sort=dashboard["sort"])
                cursor.execute(sql)
    except:
        dealFault()
def insertDashbaordTl(data):
    try:
        dashboards = data["dashboard"]
        dataLanguageEnglish = data["language"]["English"]
        dataLanguageChinese = data["language"]["Chinese"]
        table = "IAM_DASHBOARD_TL"
        for i in dashboards:
            dashboard = dashboards[i]
            Id = returnId("IAM_DASHBOARD", dashboard["code"], dashboard["namespace"])
            if Id:
                sql = "SELECT ID FROM {table} WHERE ID={id}".format(
                        table=table,
                        id=Id["ID"])
                count = cursor.execute(sql)
                if count == 0:
                    insertTl(table, 'en_US', Id["ID"], dataLanguageEnglish[i])
                    insertTl(table, 'zh_CN', Id["ID"], dataLanguageChinese[i])
                else:
                    updateTl(table, 'en_US', Id["ID"], dataLanguageEnglish[i])
                    updateTl(table, 'zh_CN', Id["ID"], dataLanguageChinese[i])
    except:
        dealFault()
def insertDashboardRole(data):
    try:
        dashboards = data["dashboard"]
        table = "IAM_DASHBOARD_ROLE"
        for i in dashboards:
            dashboard = dashboards[i]
            Id = returnId("IAM_DASHBOARD", dashboard["code"], dashboard["namespace"])
            if Id:
                if "roles" in dashboard:
                    roles = dashboard["roles"]
                    for role in roles:
                        sql = "SELECT ID FROM IAM_ROLE WHERE CODE='{code}' AND FD_LEVEL='{level}'".format(code=role, level=dashboard["level"]);
                        cursor.execute(sql)
                        roleId = cursor.fetchone()
                        if roleId:
                            sql = "SELECT ID FROM IAM_DASHBOARD_ROLE WHERE DASHBOARD_ID='{dashboardId}' AND ROLE_ID='{roleId}'".format(
                                table=table,
                                dashboardId=Id["ID"],
                                roleId=roleId["ID"]
                            )
                            cursor.execute(sql)
                            select = cursor.fetchone()   
                            if not select:
                                sql = "INSERT INTO {table} (DASHBOARD_ID, ROLE_ID) VALUES ('{dashboardId}', '{roleId}')".format(
                                    table=table,
                                    dashboardId=Id["ID"],
                                    roleId=roleId["ID"]
                                )
                                cursor.execute(sql)
    except:
        dealFault()

def insertTl(table, lang, id, name):
    sql = "INSERT INTO {table} (LANG, ID, NAME) VALUES ('{lang}','{id}','{name}')".format(
        table=table,
        lang=lang,
        id=id,
        name=name)
    cursor.execute(sql)
def updateTl(table, lang, id, name):
    sql = "UPDATE {table} SET ID='{id}', NAME='{name}' WHERE ID={id} AND LANG='{lang}'".format(
        table=table,
        lang=lang,
        id=id,
        name=name)
    cursor.execute(sql)
def dealFault():
    traceback.print_exc()
    db.rollback()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-o','--options', help='option name: yml / sql', required=True)
    parser.add_argument('-m','--modules', nargs='+', help='module name')
    parser.add_argument('-i','--ip', help='databse host', dest="host", default="localhost")
    parser.add_argument('-p','--port', type=int, help='databse port', dest="port", default=3306)
    parser.add_argument('-u','--user', help='databse user', dest="user", default="choerodon")
    parser.add_argument('-s','--secret', help='databse password', dest="passwd", default="123456")
    args = parser.parse_args()

    options = os.environ.get('DASHBOARD_OPTIONS') if os.environ.get('DASHBOARD_OPTIONS') else args.options
    if cmp(options, "yml") == 0:
        modules = args.modules
        # create dashbaord config yml
        writeYml(modules, newPathDir["wholeConfig"])
    elif (cmp(options, "sql") == 0) :
        host = os.environ.get('DB_HOST') if os.environ.get('DB_HOST') else args.host
        port = os.environ.get('DB_PORT') if os.environ.get('DB_PORT') else args.port
        user = os.environ.get('DB_USER') if os.environ.get('DB_USER') else args.user
        passwd = os.environ.get('DB_PASS') if os.environ.get('DB_PASS') else args.passwd
        dbConfig = {
            'host': host,
            'port': int(port),
            'user': user,
            'passwd': passwd,
            'charset':'utf8',
            'cursorclass':pymysql.cursors.DictCursor
        }
        db = pymysql.connect(**dbConfig)
        db.autocommit(1)
        cursor = db.cursor()
        DB_NAME = os.getenv("DB_NAME", "iam_service")
        db.select_db(DB_NAME)
        # insert dashboard into db
        insertDb()
    else:
        print "argument -o/--options must be yml or sql"
    
