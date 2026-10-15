按代码来的。缺口题也写了，面试里别把没做的讲成做了。


**开场**

1. 这个 Agent 帮谁完成什么？模型和后端各负责哪段？

> 答：顾客在对话里选店、填表、确认下单；老板用同一套对话做营销、库存、查询。模型负责理解和提议；有结构化确认时，建单、删商品、跑 SQL 都由服务端执行，不让模型直接落地。

  

2. 为什么三端共用一张图，又不能共用权限？

> 答：一张 LangGraph，入口按 `role` / `force_intent` 分开。老板 JWT 且校验商店归属；顾客免登录，只进客服；公开试用 `force_intent=marketing`，不能进库存和查数。

  

**顾客下单**

3. 三步分别存在哪？哪步还走 LLM？

> 答：选店、填表走客服节点，用 LLM 解析商品，卡片从 `ui` 推到前端。确认时如果带了完整 `order_payload`（有商品和地址），`should_resume_order` 为真，跳过意图分类，服务端直接 `create_order`。`output` 只说人话。

  

4. `ui` / `order_draft` / `order_payload` / `output` 各干什么？

> 答：`ui` 是当轮卡片，用完就清，避免下一轮再弹出。`order_draft` 跨轮记选了哪家、买什么。`order_payload` 一次性确认字段，优先于草稿和 LLM。`output` 给人看。确认字段优先级是 payload > 草稿 > LLM 兜底，避免模型把地址电话抽错。

  

5. 填完表又改口问「有没有香蕉」，草稿还在吗？

> 答：这句话不像「确认下单」，也不会带 payload，所以会重新走意图分类去答商品。`order_draft` 在 checkpointer 里，节点没返回这个字段就不会被覆盖；`ui` 会清掉，卡片不会每轮重推。用户回头点确认或再发确认，还能接上。

  

6. 为什么 `thread_id` 不拼 `shop_id`？

> 答：顾客线程是 `customer_{session_id}`。下单时 `shop_id` 会从空变成具体店，拼进去等于换了一条线程，草稿和检查点会断。

  

7. 连点两次确认会不会两单？

> 答：会。`create_order` 没有幂等键，前端也没有按请求号查结果。超时后用户再点，就是第二单。现场就说到这，别讲成已经防重。

  

**HITL 删除**

8. 为什么删除不能让模型直接调工具？

> 答：模型只解析「删哪个」。工具第一次返回 `needs_confirmation`，节点里 `interrupt()` 把图挂起，HTTP 请求结束并推确认卡片。真正删除发生在前端 `Command(resume)` 之后，服务端再 `confirm=true` 调删除工具。

  

9. 确认、取消、改口三条路？

> 答：确认：`resume={"approved": true}`，执行删除。取消：`approved=false`，回复「已取消」。改口发新消息：老板接口先 `discard_pending_delete`，用 `discard=true` 把挂起的确认收掉，再当新问题跑。

  

10. 确认弹着时服务重启，还能接上吗？

> 答：生产 checkpointer 是 `AsyncPostgresSaver`，中断状态可以活过重启，前提是前端仍用同一个 `thread_id` 去 resume。开发环境是内存 Saver，重启就丢。消息历史还有 DB 兜底，但那补的是对话，不是 interrupt 本身。

  

**Text-to-SQL**

11. 「价格超过 5 块的水果」中间几步？哪步不能信模型？

> 答：LLM 生成 SQL（temperature 0，打 `internal`）→ `validate_and_bind_sql` → 参数绑定执行 → 另一个 LLM 把行说成人话。不能信的是生成出来的 SQL 文本，尤其是里面的 `shop_id`。

  

12. 为什么要把原 WHERE 括起来？

> 答：模型可能写出 `WHERE shop_id = 2 OR 1=1`。不括就变成 `... OR 1=1 AND shop_id = :shop_id`，OR 仍能绕过。括完是 `WHERE (...原条件...) AND shop_id = :shop_id`。

  

13. 为什么禁 UNION / 子查询 / 多语句，还剥注释？

> 答：这些都能把只读查询做成读别的表或第二条语句。注释能把 `; DELETE` 藏过去，所以先剥 `--` 和 `/* */`。SQL 生成打 `internal`，SSE 里直接丢掉，用户看不到 SQL。

  

14. 模型把 `shop_id` 写进字符串，和参数绑定差在哪？

> 答：写进字符串就能改成别的店。执行时是 `text(sql), {"shop_id": shop_id}`，值来自登录态注入的 state，不来自模型。

  

**路由和隔离**

15. 什么时候走 LLM 分类？

> 答：公开试用有 `force_intent`，不分类，直接营销。顾客 `role=customer`，固定进客服。只有老板才 LLM 分类到营销 / 库存 / 查询 / 店铺管理 / 订单，对不上就 fallback。

  

16. 6 个业务 Agent 怎么数？

> 答：营销、库存、查询、店铺管理、订单、客服。Supervisor 只路由，不算业务 Agent。老板侧是前 5 路，顾客是客服这一路。

  

17. `shop_id` 从哪来，为什么不让模型在 tool call 里带？

> 答：老板请求先 JWT，再查商店 `owner_id`，通过后把 `req.shop_id` 写入 graph state。工具一律 `get_shop_id(state)`。模型如果能传 `shop_id`，就等于可以改操作对象。

  

18. JWT 有效，请求体换成别人的 `shop_id`？

> 答：老板 `/api/generate` 会 `get_shop` 再比 `owner_id`，不是自己的店直接 403。顾客端没有这层归属，`shop_id` 表示选了哪家，不是老板权限。

  

**上线**

19. Redis 挂了限流怎么办？为什么不用 `BaseHTTPMiddleware`？

> 答：计数失败就放行，避免把整个 API 打死。限流是纯 ASGI 中间件；`BaseHTTPMiddleware` 会把 SSE 流式接口掐断。默认 30 次/分钟，按 IP 固定窗口。

  

20. SSE 推什么、滤什么？

> 答：推 `thinking`（reasoning）、`token`、顾客卡片 `shop_list`/`order_form`、删除确认 `confirm_delete`。滤掉 supervisor 节点和带 `internal` 的调用，所以 SQL、意图 JSON 不会进对话。

  

**缺口题，照实说**

21. 模型说下单成功，建单接口超时，你信谁？

> 答：信数据库，不信模型话术。现在创建是请求内同步 `commit`，没有按请求号查单，也没有幂等键。超时后再点，可能第二单。改进是确认提交带 client token，创建前查、创建后可查询。

  

22. 删除 `interrupt` 期间，同一 `thread_id` 又来一条消息？

> 答：老板路径会先 discard 未完成确认，再当新消息跑，不会一边挂起一边开第二趟删除。不要说成通用的图锁。

  

23. 一人两店，各层按什么键隔离？

> 答：检查点按 `thread_id`（老板 `session_id`，顾客 `customer_{session_id}`）。商品和订单按 `shop_id`。会话历史按 `session_id` + `owner_id`。顾客取消还要核 `customer_id`。漏哪一层，都会在那一层串：线程键串草稿，`shop_id` 串商品订单，JWT 漏了就会操作到别人的店。

  

先把 3、8、11、17、21 背顺。这五题能讲完这条经历；7、10、21 碰到就承认缺口，比临场编幂等和自动恢复要稳。