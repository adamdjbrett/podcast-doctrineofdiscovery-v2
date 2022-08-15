---
layout: page
title: Contact
description: Thank you for your interest in the Doctrine of Discovery Project you can contact us at info@doctrineofdiscovery.org
image: /assets/img/mapping-doctrine-of-discovery-favicon.webp
permalink: /contact/
sitemap:
  exclude: "yes"
---

<div class="text-center p-3 col-md-8 offset-md-2">

  <form id="fs-frm" name="simple-contact-form" accept-charset="utf-8" action="https://formspree.io/f/{form_id}" method="post">
    <fieldset id="fs-frm-inputs">
      <label for="full-name">Full Name</label>
      <input class="form-control" type="text" name="name" id="full-name" placeholder="Michael Bubbly" required="">
      <label for="email-address">Email Address</label>
      <input class="form-control" type="email" name="_replyto" id="email-address" placeholder="email@domain.tld" required="">
      <label for="message">Message</label>
      <textarea class="form-control"  rows="5" name="message" id="message" placeholder="What's the fizz?" required=""></textarea>
      <input type="hidden" name="_subject" id="email-subject" value="Contact Form Submission">
    </fieldset>
	<br/>
    <input type="submit" class="btn orange p-3 float-end" value="Submit">
  </form>

<!-- subs
<form action="https://formspree.io/f/{form_id}" method="post">
  <label for="email">Your Email</label>
  <input class="form-control" name="Email" id="email" type="email"><br/>
  <button class="orange btn" type="submit">Submit</button>
</form>
-->
</div>