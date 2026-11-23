"""开发断言，不计入冻结检查集；运行 python3 -m unittest -v。"""
import unittest
from rules import revised, route

class Contract(unittest.TestCase):
    def case(self, text, knowledge='grounded'):
        return {'turns':[text], 'knowledge':knowledge}

    def test_consultation_independent_of_knowledge(self):
        for state in ['grounded','not_found','conflict','tool_error']:
            self.assertEqual(revised(self.case('有点贵，最近不急，落地多少？',state))['intent'],'consulting')

    def test_latest_refusal_overrides_old_question(self):
        c={'turns':['优惠多少？','已经买了别家的，不要再联系。'],'knowledge':'grounded'}
        self.assertEqual(revised(c)['intent'],'declined')
        self.assertEqual(route(c,revised(c)),'end')

    def test_phone_refusal_does_not_erase_wecom_question(self):
        c=self.case('别打电话了，报价发我已经加的企微。','not_found')
        self.assertEqual(revised(c)['intent'],'consulting')
        self.assertEqual(revised(c)['phone'],'denied')
        self.assertEqual(route(c,revised(c)),'verify')

    def test_weak_information_remains_unknown(self):
        self.assertEqual(revised(self.case('嗯，知道了。'))['intent'],'unknown')

    def test_no_empty_conversation(self):
        with self.assertRaises(ValueError):revised({'turns':[],'knowledge':'grounded'})

if __name__=='__main__':unittest.main()
