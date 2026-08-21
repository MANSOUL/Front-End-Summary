## AI写的一个坑

```js
function Component() {
  const [tasks, setTasks] = useState([]); // 更新状态
  const tasksRef = useRef([]) // 存储状态

  const updateTask = useCallback(
    (uid: string, patch: Partial<UploadTask>) => {
      // AI写的
      // setTask((prev) => {
      //   const next = prev.map((t) => (t.uid === uid ? { ...t, ...patch } : t));
      //   tasksRef.current = next;
      //   return next
      // })

      // 后面修改的
      const next = tasksRef.current.map((t) => (t.uid === uid ? { ...t, ...patch } : t));
      tasksRef.current = next;
      setTasks(next);
    },
    [],
  );

  // 网络请求
  const request = useCallback(async (uid) => {

    // 更新进度
    const t = tasksRef.current.find((x) => x.uid === uid);
    if (t) {
      const newSet = new Set(t.uploadedChunks)
      newSet.add(index)
      const progress = Math.round((newSet.size / t.totalChunks) * 100)
      updateTask(uid, {
        uploadedChunks: newSet,
        progress,
      })
    }
  })

}

```