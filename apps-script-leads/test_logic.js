// Run: node test_logic.js
const fs = require('fs'), vm = require('vm');
const ctx = {};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(__dirname + '/Logic.gs', 'utf8'), ctx);
let pass = 0, fail = 0;
function eq(name, got, want) {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : fail++;
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (ok ? '' : '  got=' + JSON.stringify(got) + ' want=' + JSON.stringify(want)));
}
eq('valid email', ctx.isValidEmail('a@b.co'), true);
eq('invalid email', ctx.isValidEmail('a@b'), false);
eq('empty email', ctx.isValidEmail(''), false);
eq('budget 5000', ctx.budgetPoints(5000), 40);
eq('budget 500', ctx.budgetPoints(500), 30);
eq('budget 150', ctx.budgetPoints('150'), 15);
eq('budget 50', ctx.budgetPoints(50), 0);
eq('budget NaN', ctx.budgetPoints('abc'), 0);
eq('size 50+', ctx.sizePoints('50+'), 30);
eq('size unknown', ctx.sizePoints('zzz'), 0);
eq('timeline asap (case)', ctx.timelinePoints(' ASAP '), 30);
eq('timeline unknown', ctx.timelinePoints('later'), 0);
eq('business email', ctx.isBusinessEmail('x@acme.com'), true);
eq('free email', ctx.isBusinessEmail('x@gmail.com'), false);
eq('hot lead', ctx.scoreLead({ email: 'a@acme.com', size: '50+', budget: 5000, timeline: 'asap' }), 100);
eq('score capped at 100', ctx.scoreLead({ email: 'a@acme.com', size: '50+', budget: 9999, timeline: 'asap' }) <= 100, true);
eq('warm lead', ctx.scoreLead({ email: 'a@gmail.com', size: '2-10', budget: 600, timeline: 'this month' }), 65);
eq('cold lead', ctx.scoreLead({ email: 'a@gmail.com', size: '1', budget: 50, timeline: 'exploring' }), 10);
eq('tier hot', ctx.tierFor(70), 'Hot');
eq('tier warm', ctx.tierFor(69), 'Warm');
eq('tier warm low', ctx.tierFor(40), 'Warm');
eq('tier cold', ctx.tierFor(39), 'Cold');
eq('validate ok', ctx.validateLead({ name: 'Ann', email: 'a@b.co', budget: 100 }).ok, true);
eq('validate fails', ctx.validateLead({ name: '', email: 'bad', budget: -5 }).errors.length, 3);
eq('email first name', ctx.buildConfirmationEmail({ name: 'Jane Cooper' }, 'Hot').body.indexOf('Hi Jane,') === 0, true);
eq('summary', ctx.summarize([{status:'Hot'},{status:'Hot'},{status:'Cold'},{status:'Invalid'},{status:'x'}]), { Hot:2, Warm:0, Cold:1, Invalid:1, total:5 });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
