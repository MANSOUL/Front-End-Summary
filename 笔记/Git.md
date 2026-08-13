#Git 使用
git是一个分布式版本控制系统，不同于集中式版本控制系统CVS、SVN。其在每台电脑本地都会有一个仓库，无需联网也可工作。

## 概念

### 四个区
工作区--->暂存区--->本地仓库--->远程仓库

### 三个步骤
```
$ git add .
$ git commit -m "comment"
$ git push
```

### 五种状态
- 原始状态(Origin)
- 已修改(Modifiled)
- 已暂存(Staged)
- 已提交(Commited)
- 已推送(Pushed)

## 初始化仓库
1. 新建一个文件夹learngit`mkdir learngit`
2. 初始化为git仓库`git init`
3. 新建文件`vi readme.md`
4. 添加文件到暂存区`git add readme.md`
5. 将文件提交到本地仓库`git commit -m "add readme file"`
为什么要先存入暂存区呢？
1. `git commit`一次性可以提交多个文件
2. 也可以多次使用`git add`添加不同的文件
加入某次你一次性改了很多个文件，然后提交时你需要告诉别人你某个文件修改了什么，这样改的意义是什么，那么这就很有用了。自行脑补～

## 版本回退

### 使用`git status`查看仓库状态
1. `git status`命令查看当前仓库状态
```
$ On branch master
$ nothing to commit, working tree clean
```
2. 修改readme.md之后，`git status`
```
$ On branch master
$ Changes not staged for commit:
$   (use "git add <file>..." to update what will be committed)
$   (use "git checkout -- <file>..." to discard changes in working directory)
$ 
$     modified:   readme.md
$ 
$ no changes added to commit (use "git add" and/or "git commit -a")
```
3. 添加readme.md至暂存区`git add readme.md`之后，`git status`
```
$ On branch master
$ Changes to be committed:
$   (use "git reset HEAD <file>..." to unstage)
$ 
$     modified:   readme.md
```
4. 添加到本地仓库`git commit -m "add distributed"`之后，`git status`。
```
$ On branch master
$ nothing to commit, working tree clean
```

### 使用`git diff`查看文件变化
1. 使用`git diff readme.md`，终端无任何输出
2. 修改readme.md之后，`git diff readme.md`
```
$ diff --git a/readme.md b/readme.md
$ index b24374a..dc2aeca 100644
$ --- a/readme.md
$ +++ b/readme.md
$ @@ -1,3 +1,4 @@
$  #Git
$  git is a distributed version control system
$  git is a free software
$ +linus is git's farther
```
3. 暂存`git add readme.md`之后，`git diff readme.md`，无输出
4. 使用`git diff --cached readme.md`
```
$ diff --git a/readme.md b/readme.md
$ index b24374a..dc2aeca 100644
$ --- a/readme.md
$ +++ b/readme.md
$ @@ -1,3 +1,4 @@
$  #Git
$  git is a distributed version control system
$  git is a free software
$ +linus is git's farther
```
5. 暂存`git commit -m "add git's farther"`之后，`git diff --cached readme.md`，无输出
总结：如上一系列操作中，每当进行一次操作之后查看文件变化都需为diff命令添加不同的参数。总而言之，这与概念中的4个区有关。
`git diff --cached`用于比较暂存区与工作区文件的变化。
当我们将变化后文件文件通过`git commit`命令提交至本地仓库之后，如此时有远程仓库可执行`git diff master origin/master readme.md`。或通过下节的`git log`命令查看变化。

### 使用`git log`查看提交日志
1. `git log`
```
$ commit a9a4f6b4b4c367035264848de9cc190f60224ca2
$ Author: MANSOUL <xiaohu12347@gmail.com>
$ Date:   Thu Dec 21 15:51:46 2017 +0800
$ 
$     add git's farther
$ 
$ commit 06a9eee91479e9e3d8aee18a104433482f776d31
$ Author: MANSOUL <xiaohu12347@gmail.com>
$ Date:   Thu Dec 21 15:40:59 2017 +0800
$ 
$     add distributed
$ 
$ commit 4941beb4c4847ed548ba9df8ad65720015a4bb1f
$ Author: MANSOUL <xiaohu12347@gmail.com>
$ Date:   Thu Dec 21 15:32:27 2017 +0800
$ 
$     add a readme file
```
2. `git diff 06a9eee91479e9e3d8aee18a104433482f776d31 readme.md`,此命令获取到本地仓库中的与工作区的文件变化
3. 使用`git log --pretty=oneline`,格式化输出
```
$ a9a4f6b4b4c367035264848de9cc190f60224ca2 add git's farther
$ 06a9eee91479e9e3d8aee18a104433482f776d31 add distributed
$ 4941beb4c4847ed548ba9df8ad65720015a4bb1f add a readme file
```

### 文件的撤销
1. 文件已做修改，但未进入暂存区`git checkout readme.md`
2. 文件已进入暂存区，但未进入本地仓库
```
$ git reset readme.md
$ git checkout readme.md
```
3. 文件已进入本地仓库，[但未推送至远程仓库]
```
$ git reset --hard HEAD^
```
或（有远程仓库的情况）
```
$ git reset --hard origin/master
```
4. 文件已推送至远程仓库
```
$ git reset --hard HEAD^
$ git push -f
```
这里说一下`git reset --hard`其实对上面几个推送阶段的撤销都能用，可是说是万金油。但尽量少用。
另外，每次我们commit都会产生一个版本，`HEAD`指的是当前版本，`HEAD^`指向上一个版本，`HEAD^^`上上个版本，以此类推。如果要找到上一百个版本呢?可以使用`HEAD~100`

### `git reflog`查看命令日志
上一步我们撤回了一次commit操作，但是当我们想再回去怎么办呢？
1. `git reflog`
```
$ a9a4f6b HEAD@{0}: reset: moving to HEAD^
$ efce7d3 HEAD@{1}: commit: add a test line
$ a9a4f6b HEAD@{2}: commit: add git's farther
$ 06a9eee HEAD@{3}: commit: add distributed
$ 4941beb HEAD@{4}: commit (initial): add a readme file
```
2. `git reset --hard [commit-id]`，在撤回到最新一次提交。

### 删除文件
1. `git rm [filename]`
2. `git commit -m "delete file"` 

## 理解暂存区
git跟踪并管理的是文件的修改，而不是文件。
使用`git add`命令能将文件的修改从工作区添加到暂存区。再使用`git commit`命令将本次修改提交到本地仓库。
暂存区可以理解为用于存放文件修改的一个区。
**`git add`操作图示：**
![仓库与工作区add图示](https://cdn.liaoxuefeng.com/cdn/files/attachments/001384907720458e56751df1c474485b697575073c40ae9000/0 "来自廖雪峰老师git教程")

**`git commit`操作图示：**
![仓库与工作区commit图示](https://cdn.liaoxuefeng.com/cdn/files/attachments/0013849077337835a877df2d26742b88dd7f56a6ace3ecf000/0 "来自廖雪峰老师git教程")

## 远程仓库
### 创建认证key
1. 创建SSH KEY
```
$ ssh-keygen -t rsa -C "youremail@example.com"
```
2. 打开生成的id_rsa.pub文件
```
$ cd ~/.ssh
$ vi id_rsa.pub
```
3. 登陆GitHub，打开“Account settings”，“SSH Keys”页面，将id_rsa.pub中的内容添加。
为什么GitHub需要SSH Key呢？
因为GitHub需要识别出你推送的提交确实是你推送的，而不是别人冒充的，而Git支持SSH协议，所以，GitHub只要知道了你的公钥，就可以确认只有你自己才能推送。
当然，GitHub允许你添加多个Key。假定你有若干电脑，你一会儿在公司提交，一会儿在家里提交，只要把每台电脑的Key都添加到GitHub，就可以在每台电脑上往GitHub推送了。

### 为项目添加远程仓库
默认使用gitHub或其他git仓库
#### 为已存在的本地仓库添加远程仓库
1. 在服务器上新建仓库
2. 获取仓库地址，并在本地仓库执行以下命令
```
$ git remote add origin git@github:MANSOUL/demo.git
```
3. 将本地仓库的内容推送至远程仓库
```
$ git push -u origin master
```
4. `git push`将以后的修改推送至远程仓库

#### 将远程仓库克隆到本地
1. 在服务器上新建仓库
2. 克隆远程仓库
```
$ git clone git@github:MANSOUL/demo.git
```

## 分支
### 分支基础
1. 创建分支
```
$ git branch dev
```
2. 切换分支
```
$ git checkout dev
```
(创建并切换分支git checkout -b dev)
3. 合并分支，切换到主分支，再合并(fast forward模式合并，快速合并)
```
$ git checkout master
$ git merge dev
```
4. 删除分支
```
$ git branch -d dev 
```
**Fast forward：**
git一般合并时会采用Fast forward模式，这种模式不会产生merge信息，如果分支删除，则会丢掉分支信息(看不出合并关系)。
采用`--no-ff`强制禁用fast forward模式。
```
$ git merge --no-ff -m "merge dev" dev
```

**主分支图示：**
>![主分支图示](https://cdn.liaoxuefeng.com/cdn/files/attachments/0013849087937492135fbf4bbd24dfcbc18349a8a59d36d000/0 "来自廖雪峰老师git教程")

**创建dev分支:**
>![dev分支图示](https://cdn.liaoxuefeng.com/cdn/files/attachments/001384908811773187a597e2d844eefb11f5cf5d56135ca000/0 "来自廖雪峰老师git教程")

**文件修改提交:**
>![文件修改图示](https://cdn.liaoxuefeng.com/cdn/files/attachments/0013849088235627813efe7649b4f008900e5365bb72323000/0 "来自廖雪峰老师git教程")

**分支合并:**
>![分支合并图示](https://cdn.liaoxuefeng.com/cdn/files/attachments/00138490883510324231a837e5d4aee844d3e4692ba50f5000/0 "来自廖雪峰老师git教程")

**分支删除:**
>![分支删除图示](https://cdn.liaoxuefeng.com/cdn/files/attachments/001384908867187c83ca970bf0f46efa19badad99c40235000/0 "来自廖雪峰老师git教程")

### 解决合并冲突
情况：两个分支都对统一文件做了修改，合并时发生冲突
1. 修改dev分支下的文件并提交
2. 修改master根治下的文件并提交
3. 合并master分支和dev分支
```
$ Auto-merging readme.md
$ CONFLICT (content): Merge conflict in readme.md
$ Automatic merge failed; fix conflicts and then commit the result.
```
4. 打开起冲突的文件，修复冲突，并提交
```
$ [master 586f4ca] fixed merger confict
```
5. 查看提交日志,`git log --pretty=oneline`
```
$ 586f4cab1f1d4cc4e2897ae33010615c9b1ed170 fixed merger confict
$ 1f1b429803cdc5c8da50d9ae72bca3f318c5ac8d add test c master
$ 0539f2f8938e9309b6998b717d8f4f969141daba add test c dev
$ ...
```
6. 使用`git log --graph`，查看分支合并图

合并之后，git将dev分支的修改也加入到了master分支的提交日志
> ![冲突解决图示](https://cdn.liaoxuefeng.com/cdn/files/attachments/00138490913052149c4b2cd9702422aa387ac024943921b000/0 "来自廖雪峰老师git教程")

### 分支管理策略
> ![团队使用策略](https://cdn.liaoxuefeng.com/cdn/files/attachments/001384909239390d355eb07d9d64305b6322aaf4edac1e3000/0 "来自廖雪峰老师git教程")

### Bug分支
描述：当前工作再dev分支上，接到一个Bug 110修复命令，需在master分支上修复。但dev还不能提交，解决Bug后回来继续工作。
1. 使用`stash`存储工作现场
```
$ git stash
```
2. 切换到master分支，修复Bug 110
3. 回到dev分支，恢复工作
4. `git stash list`查看存储的工作
5. 恢复工作，删除工作
```
$ git stash apply
$ git stash drop
```
或
```
$ git stash pop
```
6. 有多个stash时，使用
```
$ git stash apply stash@{0}
```

### Feature分支
与Bug分支类似，开发新功能时，最好建立一个分支。
要丢弃未被合并的分支使用`git branch -D <branch name>`

### 多人协作
1. `git push origin branch-name`推送修改；
2. 如推送失败，则因为远程分支比你的本地更新，用`git pull`试图合并；
3. 如果合并有冲突，则解决冲突，并在本地提交；没有冲突或者解决掉冲突后，再用`git push origin <branch-name>`推送就能成功！
4. 如果`git pull`提示“no tracking information”，则说明本地分支和远程分支的链接关系没有创建，用命令`git branch --set-upstream branch-name origin/branch-name`。

**命令：**
`git remote -v`查看远程仓库信息
`git checkout -b branch-name origin/branch-name`在本地创建与远程仓库对应的分支
`git branch --set-upstream branch-name origin/branch-name`将本地分支与远程仓库建立关联

## 标签
简短方式查看提交记录
`git log --pretty-oneline --abbrev-commit`

### 添加标签
1. `git tag <tagname>`默认为最新提交的commit添加tag
2. `git tag <tagname> <commit-id>`为某次commit添加tag
3. `git tag`查看tag
4. `git tag -a <tagname> -m "description" <commit-id>`为标签添加说明信息
5. `git show <tagname>`查看标签信息

### 删除标签
1. `git tag -d <tagname>`,删除本地标签
2. `git push origin <tagname>`,推送标签至远程
3. `git push origin --tags`,推送所有标签
4. 删除远程标签
```
$ git tag -d <tagname>
$ git push origin :refs/tags/<tagname>
```