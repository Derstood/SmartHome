# openwrt关闭ipv6

## 一、编辑网络配置文件：

vi /etc/config/network
在每个接口（如 lan, wan）段中加上：
```
option ipv6 '0'
option accept_ra '0'
option dhcpv6 'disabled'
```

示例：
```
config interface 'lan'
    option proto 'static'
    option ipaddr '192.168.1.1'
    option netmask '255.255.255.0'
    option ipv6 '0'
    option accept_ra '0'
    option dhcpv6 'disabled'
```
## 二、关闭 DHCPv6 与 RA 服务

**编辑 DHCP 配置：**

vi /etc/config/dhcp


在对应段落（如 config dhcp 'lan'）中添加或修改：
```
option dhcpv6 'disabled'
option ra 'disabled'
option ndp 'disabled'
```

并确保 odhcpd 的全局配置（如果有）中也禁用：
```
config odhcpd 'odhcpd'
    option maindhcp '0'
    option leasefile '/tmp/hosts/odhcpd'
    option leasetrigger '/usr/sbin/odhcpd-update'
    option loglevel '0'
```

## 三、关闭系统 IPv6 支持

编辑系统启动脚本：

vi /etc/sysctl.conf


添加以下几行：
```
net.ipv6.conf.all.disable_ipv6=1
net.ipv6.conf.default.disable_ipv6=1
net.ipv6.conf.lo.disable_ipv6=1
```

立即生效：
```
sysctl -p
```
## 四、删除缓存
```
rm -f /tmp/hosts/odhcpd
```
## 五、重启相关服务
```
/etc/init.d/network restart
/etc/init.d/dnsmasq restart
/etc/init.d/odhcpd stop
/etc/init.d/odhcpd disable
```

## 验证是否关闭成功

执行：
```
ifconfig | grep inet6
```