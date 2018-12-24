#!/usr/bin/env python
# -*- coding: utf-8 -*-
import pymysql
import logging
import json
from Dashboard import Dashboard

class DashboardMysql(Dashboard):
    def __init__(self, config, schema, debug):
        dbConfig = {
            'charset': 'utf8',
            'cursorclass': pymysql.cursors.DictCursor
        }
        dbConfig=dict(dbConfig.items()+config.items())
        self.db = pymysql.connect(**dbConfig)
        self.db.autocommit(1)
        self.db.select_db(schema)
        self.cursor = self.db.cursor()
        self.logger = logging.getLogger()
        if debug:
            self.logger.setLevel(logging.DEBUG)
        else:
            self.logger.setLevel(logging.INFO)

    def insertDashboard(self, data):
        try:
            dashboards = data["dashboard"]
            dataLanguageChinese = data["language"]["Chinese"]
            table = "IAM_DASHBOARD"
            for i in dashboards:
                dashboard = dashboards[i]
                if "delete" in dashboard and (dashboard["delete"] == True):
                    continue
                Id = self.returnId(table, dashboard["code"], dashboard["namespace"])
                enabled = 0 if "enabled" in dashboard and (dashboard["enabled"] == False) else 1
                position = json.dumps(dashboard["position"]) if "position" in dashboard else ""
                if Id:
                    sql = "UPDATE {table} SET CODE='{code}', FD_LEVEL='{level}', ICON='{icon}', SORT='{sort}', IS_ENABLED='{enabled}', NAMESPACE='{namespace}', POSITION='{position}'"
                    sql = (sql + " WHERE CODE='{code}' AND FD_LEVEL='{level}'").format(
                        table=table,
                        code=dashboard["code"],
                        namespace=dashboard["namespace"],
                        level=dashboard["level"],
                        icon=dashboard["icon"],
                        sort=dashboard["sort"],
                        enabled=enabled,
                        position=position)
                    self.cursor.execute(sql)
                    self.logger.debug("sql: [ %s ]", sql)
                else:
                    sql = "INSERT INTO {table} (CODE, NAME, FD_LEVEL, TITLE, DESCRIPTION, ICON, NAMESPACE, SORT, IS_ENABLED, POSITION) VALUES ('{code}', '{name}', '{level}', '{title}', '{description}', '{icon}', '{namespace}', '{sort}', '{enabled}', '{position}')"
                    sql = sql.format(
                        table=table,
                        code=dashboard["code"],
                        name=dataLanguageChinese[i],
                        level=dashboard["level"],
                        title=dashboard["title"],
                        description=dashboard["description"],
                        icon=dashboard["icon"],
                        namespace=dashboard["namespace"],
                        sort=dashboard["sort"],
                        enabled=enabled,
                        position=position)
                    self.cursor.execute(sql)
                    self.logger.debug("sql: [" + sql + "]")
        except:
            print 11111
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
                    self.logger.debug("sql: [" + sql + "]")
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
                                self.logger.debug("sql: [" + sql + "]")
                                select = self.cursor.fetchone()   
                                if not select:
                                    sql = "INSERT INTO {table} (DASHBOARD_ID, ROLE_ID) VALUES ('{dashboardId}', '{roleId}')".format(
                                        table=table,
                                        dashboardId=Id["ID"],
                                        roleId=roleId["ID"]
                                    )
                                    self.cursor.execute(sql)
                                    self.logger.debug("sql: [" + sql + "]")
        except:
            self.dealFault()