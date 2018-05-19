#!/usr/bin/python
#coding:utf-8

import os  
allFileNum = 0  
newArray = []
def printPath(level, path):  
    global allFileNum 
    dirList = []  
    fileList = []  
    files = os.listdir(path)
    dirList.append(str(level))  
    for f in files:  
        if(os.path.isdir(path + '/' + f)):  
            if(f[0] == '.'):  
                pass  
            else:  
                dirList.append(f)  
        if(os.path.isfile(path + '/' + f)):  
            fileList.append(f)  
    i_dl = 0  
    for dl in dirList:  
        if(i_dl == 0):  
            i_dl = i_dl + 1  
        else:  
            newpath = path + '/' + dl 
            newArray.append(newpath)
            printPath((int(dirList[0]) + 1), path + '/' + dl)  
    for fl in fileList:  
        newpath = path + '/' + fl
        newArray.append(newpath) 
        allFileNum = allFileNum + 1  
if __name__ == '__main__':  
    printPath(2, './src/app/iam')
    numbers = 0
    for i in range(0, len(newArray) -1 ):
      if os.path.isfile(newArray[i]):
        if os.path.splitext(newArray[i])[1] =='.js':
          offset_path = os.path.abspath(newArray[i])
          file_offset = open(offset_path, 'r')
          strs = file_offset.read()
          file_offset.close()
          if(strs[0:18] != "/*eslint-disable*/"):
            file_offset = open(offset_path, 'w')
            file_offset.write("/*eslint-disable*/")
            file_offset.close()
            file_offset = open(offset_path, 'a+')
            file_offset.write('\n')
            file_offset.write(strs)
            file_offset.close()
          else:
            numbers += 1
    print numbers
