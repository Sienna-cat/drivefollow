"""两条纯规则，不调用模型，不执行联络。失败基线不是历史生产代码。"""
import re

def validate(c):
    if not c.get('turns') or not all(isinstance(t,str) and t.strip() for t in c['turns']):
        raise ValueError('需要非空客户轮次')
    if c.get('knowledge') not in {'grounded','missing_conditions','not_found','expired','conflict','tool_error'}:
        raise ValueError('未知知识状态')

def evidence(c, intent, reason):
    t=c['turns'][-1]
    all_stop=bool(re.search(r'不要再联系|别再联系|什么都别发',t))
    phone_stop=all_stop or bool(re.search(r'不要再打电话|别打电话|别再打电话',t))
    return {'intent':intent,'phone':'denied' if phone_stop else 'unknown',
            'all_stop':all_stop,'evidence_turn':len(c['turns']),
            'evidence_text':t,'reason':reason,'priority':'not_assessed',
            'execution':'human_confirmation_required'}

def baseline(c):
    validate(c)
    t=' '.join(c['turns'])
    if c['knowledge']!='grounded' or re.search(r'贵|不急|再看看|不买|不要|别打|不需要',t):
        return evidence(c,'declined','失败模式：负向词或知识不足直接结束')
    if re.search(r'多少|价格|优惠|首付|月供|报价|补贴|试驾',t):
        return evidence(c,'consulting','简单关键词命中')
    return evidence(c,'unknown','未命中')

def revised(c):
    validate(c)
    t=c['turns'][-1]
    # 演示版只理解最后一条客户表达，跨轮省略和复杂否定留作失败分析。
    if re.search(r'不要再联系|别再联系|什么都别发|不想了解|已经买了|已经买别家|再便宜也不买|不用介绍',t):
        return evidence(c,'declined','最新明确拒绝或停止联系')
    if re.search(r'多少|价格|优惠|首付|月供|报价|补贴|试驾|费用|配置|抵多少',t):
        return evidence(c,'consulting','保留咨询信号；知识状态不参与意向分类')
    if re.search(r'不买|不需要|别打电话|不要再打电话',t):
        return evidence(c,'declined','无继续咨询的明确拒绝')
    return evidence(c,'unknown','证据不足，保留未知')

def route(c, out):
    # 两组共用同一路由器；只建议，不据此创建回访/派单/发消息。
    if out['all_stop'] or out['intent']=='declined':return 'end'
    if out['intent']=='unknown':return 'clarify'
    if c['knowledge']=='grounded':return 'answer'
    if c['knowledge']=='missing_conditions':return 'clarify'
    return 'verify'
