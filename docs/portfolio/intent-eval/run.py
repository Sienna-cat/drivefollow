"""标准库可复跑；冻结后不按结果修改规则或参照。"""
from pathlib import Path
import csv, hashlib, json, time, datetime
from rules import baseline,revised,route

P=Path(__file__).resolve().parent
manifest=json.loads((P/'freeze-manifest.json').read_text())
for name,sha in manifest['hashes'].items():
    assert hashlib.sha256((P/name).read_bytes()).hexdigest()==sha, f'冻结文件变更：{name}'
rows=[];summary={}
for split in ['development','frozen']:
    cases=json.loads((P/(split+'.json')).read_text())
    summary[split]={}
    for label,fn in [('failure_baseline',baseline),('revised_rule',revised)]:
        subset=[]
        for c in cases:
            start=time.perf_counter_ns();out=fn(c);out['action']=route(c,out)
            elapsed=(time.perf_counter_ns()-start)/1e6
            errors=[k for k,v in c['reference'].items() if out[k]!=v]
            row={'id':c['id'],'split':split,'variant':label,'input':c,'actual':out,
                 'errors':errors,'passed':not errors,'rule_cpu_ms':elapsed,
                 'model':None,'external_calls':0,'api_cost':None}
            rows.append(row);subset.append(row)
        consult=[r for r in subset if r['input']['reference']['intent']=='consulting']
        stops=[r for r in subset if r['input']['reference']['phone']=='denied']
        summary[split][label]={'n':len(subset),'all_fields_pass':sum(r['passed'] for r in subset),
          'intent_correct':sum('intent' not in r['errors'] for r in subset),
          'consultation_n':len(consult),'consultation_misclassified_declined':sum(r['actual']['intent']=='declined' for r in consult),
          'phone_stop_n':len(stops),'phone_stop_missed':sum(r['actual']['phone']!='denied' for r in stops),
          'failed_ids':[r['id'] for r in subset if not r['passed']]}
summary.update({'generated_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),
 'dataset':'hesitation-routing-v1','status':'synthetic_rule_comparison_executed',
 'model_comparison':'not_run','production_baseline':False,'independent_test':False,
 'timing_scope':'仅本机纯规则函数单次CPU计时，非模型延迟或线上SLA',
 'cost_scope':'没有外部API调用；模型成本未测，未计开发/标注/人工成本',
 'knowledge_pair':{v:len({r['actual']['intent'] for r in rows if r['variant']==v and r['input']['pair_group']=='K01'})==1 for v in ['failure_baseline','revised_rule']}})
(P/'raw-results.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
(P/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
with (P/'逐例结果.csv').open('w',encoding='utf-8-sig',newline='') as f:
    writer=csv.writer(f);writer.writerow(['ID','集合','版本','客户轮次','知识状态','参照','输出','错误字段','通过','规则CPU毫秒'])
    for r in rows:writer.writerow([r['id'],r['split'],r['variant'],' / '.join(r['input']['turns']),r['input']['knowledge'],json.dumps(r['input']['reference'],ensure_ascii=False),json.dumps(r['actual'],ensure_ascii=False),','.join(r['errors']),r['passed'],r['rule_cpu_ms']])
print(json.dumps(summary,ensure_ascii=False,indent=2))
