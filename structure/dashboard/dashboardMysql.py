#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pymysql
from Dashboard import Dashboard

class DashboardMysql(Dashboard):
    def __init__(self, config, schema):
        dbConfig = {
            'charset': 'utf8',
            'cursorclass': pymysql.cursors.DictCursor
        }
        dbConfig=dict(dbConfig.items()+config.items())
        self.db = pymysql.connect(**dbConfig)
        self.db.autocommit(1)
        self.db.select_db(schema)
        self.cursor = self.db.cursor()

    def insertDashboard(self, data):
        try:
            dashboards = data["dashboard"]
            dataLanguageChinese = data["language"]["Chinese"]
            table = "IAM_DASHBOARD"
            for i in dashboards:
                dashboard = dashboards[i]
                Id = self.returnId(table, dashboard["code"], dashboard["namespace"])
                if Id:
                    sql = "UPDATE {table} SET CODE='{code}', FD_LEVEL='{level}', ICON='{icon}', SORT='{sort}', NAMESPACE='{namespace}'"
                    sql = (sql + " WHERE CODE='{code}' AND FD_LEVEL='{level}'").format(
                        table=table,
                        code=dashboard["code"],
                        namespace=dashboard["namespace"],
                        level=dashboard["level"],
                        icon=dashboard["icon"],
                        sort=dashboard["sort"])
                    self.cursor.execute(sql)
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
                    self.cursor.execute(sql)
        except:
            self.dealFault()
    def insertDashbaordTl(self, data):
        try:
            dashboards = data["dashboard"]
            dataLanguageEnglish = data["language"]["English"]
            dataLanguageChinese = data["language"]["Chinese"]
            table = "IAM_DASHBOARD_TL"
            for i in dashboards:
                dashboard = dashboards[i]
                Id = self.returnId("IAM_DASHBOARD", dashboard["code"], dashboard["namespace"])
                if Id:
                    sql = "SELECT ID FROM {table} WHERE ID={id}".format(
                            table=table,
                            id=Id["ID"])
                    count = self.cursor.execute(sql)
                    if count == 0:
                        self.insertTl(table, 'en_US', Id["ID"], dataLanguageEnglish[i])
                        self.insertTl(table, 'zh_CN', Id["ID"], dataLanguageChinese[i])
                    else:
                        self.updateTl(table, 'en_US', Id["ID"], dataLanguageEnglish[i])
                        self.updateTl(table, 'zh_CN', Id["ID"], dataLanguageChinese[i])
        except:
            self.dealFault()
    def insertDashboardRole(self, data):
        try:
            dashboards = data["dashboard"]
            table = "IAM_DASHBOARD_ROLE"
            for i in dashboards:
                dashboard = dashboards[i]
                Id = self.returnId("IAM_DASHBOARD", dashboard["code"], dashboard["namespace"])
                if Id:
                    if "roles" in dashboard:
                        roles = dashboard["roles"]
                        for role in roles:
                            sql = "SELECT ID FROM IAM_ROLE WHERE CODE='{code}' AND FD_LEVEL='{level}'".format(code=role, level=dashboard["level"]);
                            self.cursor.execute(sql)
                            roleId = self.cursor.fetchone()
                            if roleId:
                                sql = "SELECT ID FROM IAM_DASHBOARD_ROLE WHERE DASHBOARD_ID='{dashboardId}' AND ROLE_ID='{roleId}'".format(
                                    table=table,
                                    dashboardId=Id["ID"],
                                    roleId=roleId["ID"]
                                )
                                self.cursor.execute(sql)
                                select = self.cursor.fetchone()   
                                if not select:
                                    sql = "INSERT INTO {table} (DASHBOARD_ID, ROLE_ID) VALUES ('{dashboardId}', '{roleId}')".format(
                                        table=table,
                                        dashboardId=Id["ID"],
                                        roleId=roleId["ID"]
                                    )
                                    self.cursor.execute(sql)
        except:
            self.dealFault()