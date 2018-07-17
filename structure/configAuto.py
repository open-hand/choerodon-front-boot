#!/usr/bin/python3
# _*_ coding:utf-8 _*_

import sys
import yaml
import json
import os

content = {}
centerContent = {}
baseDirs = os.path.abspath(os.path.join(os.path.dirname("__file__")))
pathDir = {
    "menuDirs": '{baseDirs}/{value}/src/app/{value}/config/Menu.yml',
    "deployDirs": '{baseDirs}/.deploy.yml',
    "languageEnDir": '{baseDirs}/{value}/src/app/{value}/config/language/en.yml',
    "languagezhDir": '{baseDirs}/{value}/src/app/{value}/config/language/zh.yml',
}
newPathDir = {
    "languageDirs": '{baseDirs}/config/language/{language}.yml',
    "menuDirs": '{baseDirs}/config/Menu.yml',
    "wholeConfig": '{baseDirs}/config.yml'
}
levelArray = ["site","organization", "project", "user"]
# 把文件写去yml文件
def writeYml(obj, pathDir, language=None):
    ymlString = pathDir.format(baseDirs = baseDirs, language = language)
    ymlFile = open(ymlString, 'w+')
    ymlFile.write(json.dumps(obj))
    ymlFile.close()
# 目录文件路径
def adjustString(Dirstring, value=None):
    endString = Dirstring.format(baseDirs = baseDirs, value = value)
    return endString
# yml文件读取函数
def adjustContent(dirName):
    for i in sys.argv[1:len(sys.argv)]:
        ymlFile = open(adjustString(dirName, i))
        content[i] = yaml.load(ymlFile)
    return content


# serviceCode = os.getenv("PROJECT_NAME", None)
# serviceGroup = os.getenv("GROUP_NAME", None)
# serviceKind = os.getenv("SERVICE_KIND", None)
serviceCode = 'choerodon.code'
serviceGroup = 'choerodon-front'
serviceKind = 'choerodon-front'

if not (serviceCode and serviceGroup and serviceKind):
    # 读取depolyment
    ymlFile = open(adjustString(pathDir["deployDirs"]))
    contentDeploy = yaml.load(ymlFile)
    # 服务的code和Group
    # serviceCode = serviceCode or contentDeploy["code"]
    # serviceGroup = serviceGroup or contentDeploy["group"]
    serviceCode = 'choerodon.code'
    serviceGroup = 'choerodon-front'
    serviceKind = 'choerodon-front'
    # serviceKind = serviceKind or contentDeploy["kind"]
    ymlFile.close()


# 读取中英yml文件
def languageYml(languageDir):
    centerObj = {}
    languageContent = adjustContent(languageDir)
    for i in sys.argv[1:len(sys.argv)]:
        for k in languageContent[i].keys():
            centerArray = '{code}.{module}'.format(code = serviceCode, module = k)
            centerObj[centerArray] = languageContent[i][k]
            centerContent.update(centerObj)
    return centerObj
# 读取menuYml数据文件
def menuYml(path):
    centerObj = {}
    menuYmlContent = adjustContent(path)
    for i in sys.argv[1:len(sys.argv)]:
        for k in menuYmlContent[i].keys():
            centerArray = '{code}.{module}'.format(code = serviceCode, module = k)
            if centerArray not in centerObj.keys():
                centerObj[centerArray] = menuYmlContent[i][k]
            centerLevel = []
            for level in levelArray:
                for saveLevel in menuYmlContent[i][k].keys():
                    if saveLevel == level:
                        centerLevel.append(saveLevel)
            for level in centerLevel:
                centerObj[centerArray][level] = (menuDirYml(menuYmlContent[i][k][level], centerArray))
                centerContent.update(centerObj)
    return centerObj
def menuDirYml(menuYmlContent, moduleDir):
    centerLevel = {}
    for (n,index) in zip(menuYmlContent,range(0,len(menuYmlContent))):
        for j in n.keys():
            centerMenuDir = '{codeModule}.{menu}'.format(codeModule = moduleDir,menu = j)
            centerLevel[centerMenuDir] = menuYmlContent[index][j];
    return centerLevel
# 文件整合

whole = {
    "group": serviceGroup,
    "code": serviceCode,
    "kind": serviceKind,
    "language": {
        "English": languageYml(pathDir["languageEnDir"]),
        "Chinese": languageYml(pathDir["languagezhDir"]),
    },
    "menu": menuYml(pathDir["menuDirs"])
}
# # 把文件写去yml文件中文
# writeYml(languageYml(pathDir["languageEnDir"]), newPathDir["languageDirs"], 'ch')
# # 把文件写去yml文件英文
# writeYml(languageYml(pathDir["languagezhDir"]), newPathDir["languageDirs"], 'en')
# # 把文件写入menu文件
writeYml(whole, newPathDir["wholeConfig"])