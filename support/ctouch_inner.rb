#!/usr/bin/ruby -Ku
#coding:utf-8
if RUBY_VERSION < '1.9.0' then $KCODE="u" end

#usage: ctouch_inner.rb ctouch_touch.js > ctouch/ctouch_touch.js
id=ARGV[0].sub('.','_')

#I need to use innerHTML to handle linebreak.
print <<EOM
//generated by ctouch_inner.rb
var s=document.createElement('script');
s.type='text/javascript';
s.id='#{id}';
s.innerHTML="\\
EOM
while s=gets
	s.chomp!
	s.gsub!("\"","'")
	puts s+"\\n\\"
end

print <<EOM
";
document.documentElement.appendChild(s);
EOM
